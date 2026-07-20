using System;
using Microsoft.AspNetCore.Http;
using POS.Core.Interfaces;

namespace POS.Infrastructure.Services
{
    public class TenantContextAccessor : ITenantContextAccessor
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
        public static readonly Guid DefaultTenantId = Guid.Parse("d3b07384-d113-4956-d5c3-08d7d9b9542a");

        public TenantContextAccessor(IHttpContextAccessor httpContextAccessor)
        {
            _httpContextAccessor = httpContextAccessor;
        }

        public Guid CurrentTenantId
        {
            get
            {
                var httpContext = _httpContextAccessor?.HttpContext;
                if (httpContext != null && httpContext.Request.Headers.TryGetValue("X-Tenant-Id", out var tenantIdStr))
                {
                    if (Guid.TryParse(tenantIdStr, out var tenantId))
                    {
                        return tenantId;
                    }
                }
                
                return DefaultTenantId;
            }
        }
    }
}
