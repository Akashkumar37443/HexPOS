using System;
using POS.Core.Interfaces;

namespace POS.Core.Entities
{
    public class Inventory : IMultiTenantEntity
    {
        public Guid Id { get; set; }
        public Guid TenantId { get; set; }
        public Guid VariantId { get; set; }
        public int Quantity { get; set; }
    }
}
