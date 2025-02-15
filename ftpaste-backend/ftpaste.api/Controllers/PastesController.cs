using FTPaste.Models;
using FTPaste.Repositories;
using FTPaste.Helpers;
using Microsoft.AspNetCore.Mvc;

namespace FTPaste.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PastesController : ControllerBase
    {
        private readonly IPasteRepository _pasteRepository;
        private readonly int _maxExpirationHours;

        public PastesController(IPasteRepository pasteRepository, IConfiguration configuration)
        {
            _pasteRepository = pasteRepository;
            _maxExpirationHours = configuration.GetValue<int>("PasteSettings:MaxExpirationHours", 1);
        }

        [HttpPost]
        public async Task<IActionResult> CreatePaste([FromBody] Paste paste)
        {
            if (string.IsNullOrEmpty(paste.Content))
            {
                return BadRequest("Content must not be emplty.");
            }

            paste.Id = Guid.NewGuid();
            paste.CreatedAt = DateTime.UtcNow.ToUnixEpoch();
            paste.DeleteToken = Guid.NewGuid().ToString();


            var maxExpiration = DateTime.UtcNow.AddHours(_maxExpirationHours).ToUnixEpoch();
            // Check the expiration time
            if (paste.ExpiresAt.HasValue)
            {
                if (paste.ExpiresAt.Value > maxExpiration)
                {
                    paste.ExpiresAt = maxExpiration;
                }
            }
            else
            {
                paste.ExpiresAt = maxExpiration;
            }

            await _pasteRepository.CreatePasteAsync(paste);

            var response = new CreatePasteResponse
            {
                PasteId = paste.Id,
                DeleteToken = paste.DeleteToken
            };

            return Ok(response);
        }

        [HttpGet("{pasteId}")]
        public async Task<IActionResult> GetPaste(Guid pasteId)
        {
            var paste = await _pasteRepository.GetPasteAsync(pasteId);
            if (paste == null || IsPasteExpired(paste))
            {
                return NotFound();
            }

            var response = new GetPasteResponse
            {
                Id = paste.Id,
                Content = paste.Content
            };

            return Ok(response);
        }

        [HttpDelete("{pasteId}")]
        public async Task<IActionResult> DeletePaste(Guid pasteId, [FromHeader(Name = "Delete-Token")] string deleteToken)
        {
            var paste = await _pasteRepository.GetPasteAsync(pasteId);
            if (paste == null || IsPasteExpired(paste))
            {
                return NotFound();
            }

            if (paste.DeleteToken != deleteToken)
            {
                return Unauthorized();
            }

            await _pasteRepository.DeletePasteAsync(pasteId);

            return NoContent();
        }

        [HttpGet("{pasteId}/raw")]
        public async Task<IActionResult> GetRawPasteContent(Guid pasteId)
        {
            var paste = await _pasteRepository.GetPasteAsync(pasteId);
            if (paste == null || IsPasteExpired(paste))
            {
                return NotFound();
            }

            return Content(paste.Content, "text/plain");
        }

        private bool IsPasteExpired(Paste paste)
        {
            return paste.ExpiresAt.HasValue && paste.ExpiresAt.Value < DateTime.UtcNow.ToUnixEpoch();
        }
    }
}