using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using System;
using System.Threading;
using System.Threading.Tasks;
using POS.Core.Interfaces;
using POS.Core.Entities;

namespace POS.Infrastructure.Data
{
    /// <summary>
    /// Intercepts database save operations to enforce multi-tenant logical isolation.
    /// Automatically injects the TenantId from the current Execution Context into all new entities.
    /// </summary>
    public class TenantSaveChangesInterceptor : SaveChangesInterceptor
    {
        private readonly ITenantContextAccessor _tenantContextAccessor;

        public TenantSaveChangesInterceptor(ITenantContextAccessor tenantContextAccessor)
        {
            _tenantContextAccessor = tenantContextAccessor ?? throw new ArgumentNullException(nameof(tenantContextAccessor));
        }

        public override InterceptionResult<int> SavingChanges(DbContextEventData eventData, InterceptionResult<int> result)
        {
            EnforceTenantIsolation(eventData.Context);
            return base.SavingChanges(eventData, result);
        }

        public override ValueTask<InterceptionResult<int>> SavingChangesAsync(DbContextEventData eventData, InterceptionResult<int> result, CancellationToken cancellationToken = default)
        {
            EnforceTenantIsolation(eventData.Context);
            return base.SavingChangesAsync(eventData, result, cancellationToken);
        }

        private void EnforceTenantIsolation(DbContext? context)
        {
            if (context == null) return;

            var currentTenantId = _tenantContextAccessor.CurrentTenantId;
            if (currentTenantId == Guid.Empty)
            {
                // Strict isolation: if no tenant is found in scope, block the transaction entirely.
                throw new UnauthorizedAccessException("Critical Security Fault: No Tenant Context established during database mutation.");
            }

            var entries = context.ChangeTracker.Entries();

            foreach (var entry in entries)
            {
                if (entry.Entity is IMultiTenantEntity tenantEntity)
                {
                    switch (entry.State)
                    {
                        case EntityState.Added:
                            tenantEntity.TenantId = currentTenantId;
                            break;

                        case EntityState.Modified:
                        case EntityState.Deleted:
                            // Prevent cross-tenant tampering
                            if (tenantEntity.TenantId != currentTenantId)
                            {
                                throw new UnauthorizedAccessException($"Data Breach Attempt: Tried to modify entity belonging to Tenant {tenantEntity.TenantId} from Context {currentTenantId}.");
                            }
                            break;
                    }
                }
            }
        }
    }
}
