using System;
using Microsoft.AspNetCore.Mvc;
using GraziosoSalvare.Data;

namespace GraziosoSalvare.Controllers
{
    [ApiController]
    public class SystemController : ControllerBase
    {
        private readonly GSDbContext _context;
        private readonly ILogger<SystemController> _logger;

        public SystemController(GSDbContext context, ILogger<SystemController> logger)
        {
            _context = context;
            _logger = logger;
        }
        
        [HttpGet]
        [Route("")]
        [Route("api/smoke")]
        public IActionResult GetRoot()
        {
            _logger.LogInformation("GetRoot");
            return Ok(new
            {
                Message = "Grazioso Salvare API is running smoothly!",
                Status = "Healthy",
                Timestamp = DateTime.UtcNow
            });
        }

        [HttpGet]
        [Route("health")]
        public IActionResult GetHealth()
        {
            _logger.LogInformation("GetHealth");
            try
            {
                if (_context.Database.CanConnect())
                {
                    _logger.LogInformation("Health check passed.");
                    return Ok(new
                    {
                        Status = "Healthy",
                        Database = "Connected",
                        Timestamp = DateTime.UtcNow
                    });
                }
                _logger.LogError("Database connection failed");
                return StatusCode(503, new
                {
                    Status = "Unhealthy",
                    Database = "Connection Failed",
                    Timestamp = DateTime.UtcNow
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Health check failed");
                return StatusCode(500, new
                {
                    Status = "Unhealthy",
                    Error = ex.Message,
                    Timestamp = DateTime.UtcNow
                });
            }
        }
    }
}