using System;

namespace POS.Core.Interfaces
{
    public interface IMultiTenantEntity
    {
        Guid TenantId { get; set; }
    }
}
