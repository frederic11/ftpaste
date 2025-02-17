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
            // Check if the model is valid according to data annotations
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Content validations
            if (string.IsNullOrEmpty(paste.Content))
            {
                return BadRequest("Content must not be empty.");
            }

            // Check if content only contains whitespace, control characters, or zero-width characters
            if (string.IsNullOrWhiteSpace(paste.Content) ||
                paste.Content.All(c => char.IsControl(c)) ||
                paste.Content.All(c => c == '\u200B' || c == '\u200C' || c == '\u200D' || c == '\uFEFF'))
            {
                return BadRequest("Content must contain visible characters.");
            }

            if (paste.Content.Length > Paste.MaxContentLength)
            {
                return BadRequest($"Content exceeds maximum allowed size of {Paste.MaxContentLength / (1024 * 1024)}MB.");
            }

            // Language validation
            if (string.IsNullOrEmpty(paste.Language))
            {
                paste.Language = "plaintext";
            }

            // Initialize required fields
            paste.Id = Guid.NewGuid();
            paste.CreatedAt = DateTime.UtcNow.ToUnixEpoch();
            paste.DeleteToken = Guid.NewGuid().ToString();

            // Expiration time validation and setup
            var maxExpiration = DateTime.UtcNow.AddHours(_maxExpirationHours).ToUnixEpoch();

            if (paste.ExpiresAt.HasValue)
            {
                if (paste.ExpiresAt.Value <= paste.CreatedAt)
                {
                    return BadRequest("Expiration time must be in the future.");
                }

                if (paste.ExpiresAt.Value > maxExpiration)
                {
                    paste.ExpiresAt = maxExpiration;
                }
            }
            else
            {
                paste.ExpiresAt = maxExpiration;
            }

            try
            {
                await _pasteRepository.CreatePasteAsync(paste);

                var response = new CreatePasteResponse
                {
                    PasteId = paste.Id,
                    DeleteToken = paste.DeleteToken
                };

                // Return 201 Created with the resource location
                return CreatedAtAction(
                    nameof(GetPaste),
                    new { pasteId = paste.Id },
                    response
                );
            }
            catch (Exception)
            {
                // Log the exception here
                return StatusCode(500, "An error occurred while creating the paste.");
            }
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
                Content = paste.Content,
                Language = paste.Language
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