using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using POS.Core.Entities;
using POS.Core.Interfaces;

namespace POS.Application.Orders.Commands
{
    public class ProcessSecureCheckoutCommand : IRequest<Guid>
    {
        public Guid CartId { get; set; }
        public string ClientStateHash { get; set; } = string.Empty;
        public Guid TerminalId { get; set; }
        public Guid CashierId { get; set; }
        // Contains variant IDs, quantities, etc.
        public CheckoutPayload Payload { get; set; } = new();
    }

    public class CheckoutPayload
    {
        public decimal TotalAmount { get; set; }
        public System.Collections.Generic.List<CartLineDto> Lines { get; set; } = new();
    }

    public class CartLineDto
    {
        public Guid VariantId { get; set; }
        public int Quantity { get; set; }
    }

    public class ProcessSecureCheckoutCommandHandler : IRequestHandler<ProcessSecureCheckoutCommand, Guid>
    {
        private readonly IDbContextFactory _dbFactory;
        private readonly ITenantContextAccessor _tenantAccessor;
        private readonly IRedisBus _redisBus;
        private readonly ILogger<ProcessSecureCheckoutCommandHandler> _logger;

        public ProcessSecureCheckoutCommandHandler(
            IDbContextFactory dbFactory,
            ITenantContextAccessor tenantAccessor,
            IRedisBus redisBus,
            ILogger<ProcessSecureCheckoutCommandHandler> logger)
        {
            _dbFactory = dbFactory;
            _tenantAccessor = tenantAccessor;
            _redisBus = redisBus;
            _logger = logger;
        }

        public async Task<Guid> Handle(ProcessSecureCheckoutCommand request, CancellationToken cancellationToken)
        {
            var tenantId = _tenantAccessor.CurrentTenantId;
            _logger.LogInformation("Initiating secure checkout for Tenant {TenantId} on Terminal {TerminalId}", tenantId, request.TerminalId);

            // Use explicit transaction boundary for pessimistic locking and atomicity
            await using var context = await _dbFactory.CreateDbContextAsync(cancellationToken);
            await using var transaction = await context.Database.BeginTransactionAsync(System.Data.IsolationLevel.RepeatableRead, cancellationToken);

            try
            {
                // 1. Pessimistic Lock on Inventory (SELECT ... FOR UPDATE equivalent)
                var variantIds = request.Payload.Lines.Select(l => l.VariantId).ToList();
                
                // Entity Framework raw SQL to issue row-level locks
                var inventoryItems = await context.Inventory
                    .FromSqlRaw("SELECT * FROM Inventory WITH (UPDLOCK, ROWLOCK) WHERE TenantId = {0} AND VariantId IN ({1})", tenantId, string.Join(",", variantIds))
                    .ToListAsync(cancellationToken);

                // 2. Validate Stock and Reduce
                foreach (var line in request.Payload.Lines)
                {
                    var stockRecord = inventoryItems.FirstOrDefault(i => i.VariantId == line.VariantId);
                    if (stockRecord == null || stockRecord.Quantity < line.Quantity)
                    {
                        throw new InvalidOperationException($"Insufficient stock for Variant {line.VariantId}. Checkout aborted.");
                    }
                    stockRecord.Quantity -= line.Quantity;
                }

                // 3. Construct Order & Ledger Auditing
                var order = new Order
                {
                    Id = Guid.NewGuid(),
                    TenantId = tenantId,
                    TerminalId = request.TerminalId,
                    CashierId = request.CashierId,
                    TotalAmount = request.Payload.TotalAmount,
                    ClientHash = request.ClientStateHash, // Save client hash for forensic auditing
                    CreatedAt = DateTime.UtcNow,
                    Status = OrderStatus.Completed
                };

                context.Orders.Add(order);

                // Append Immutable Ledger Entry
                var ledgerEntry = new FinancialLedger
                {
                    Id = Guid.NewGuid(),
                    TenantId = tenantId,
                    OrderId = order.Id,
                    CashierId = request.CashierId,
                    Amount = order.TotalAmount,
                    TransactionType = TransactionType.Credit,
                    Timestamp = DateTime.UtcNow
                };

                context.Ledgers.Add(ledgerEntry);

                // 4. Commit atomic operation
                await context.SaveChangesAsync(cancellationToken);
                await transaction.CommitAsync(cancellationToken);

                _logger.LogInformation("Checkout completed successfully. Order {OrderId}", order.Id);

                // 5. Broadcast lightweight Sync Frame to Redis
                var syncEvent = new
                {
                    Event = "CHECKOUT_COMPLETE",
                    TenantId = tenantId,
                    TerminalId = request.TerminalId,
                    OrderId = order.Id,
                    Lines = request.Payload.Lines
                };

                await _redisBus.PublishAsync($"tenant:{tenantId}:events", syncEvent, cancellationToken);

                return order.Id;
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync(cancellationToken);
                _logger.LogError(ex, "Secure checkout failed for Tenant {TenantId}. Transaction rolled back.", tenantId);
                throw;
            }
        }
    }
}
