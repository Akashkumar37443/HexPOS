using System;

namespace POS.Core.Interfaces
{
    public interface ITenantContextAccessor
    {
        Guid CurrentTenantId { get; }
    }
}
