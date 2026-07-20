using System;
using POS.Core.Interfaces;

namespace POS.Core.Entities
{
    public class Order : IMultiTenantEntity
    {
        public Guid Id { get; set; }
        public Guid TenantId { get; set; }
        public Guid TerminalId { get; set; }
        public Guid CashierId { get; set; }
        public decimal TotalAmount { get; set; }
        public string ClientHash { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public OrderStatus Status { get; set; }
    }
}
