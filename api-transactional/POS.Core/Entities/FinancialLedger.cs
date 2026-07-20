using System;
using POS.Core.Interfaces;

namespace POS.Core.Entities
{
    public class FinancialLedger : IMultiTenantEntity
    {
        public Guid Id { get; set; }
        public Guid TenantId { get; set; }
        public Guid OrderId { get; set; }
        public Guid CashierId { get; set; }
        public decimal Amount { get; set; }
        public TransactionType TransactionType { get; set; }
        public DateTime Timestamp { get; set; }
    }
}
