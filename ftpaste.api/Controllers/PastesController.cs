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

        public PastesController(IPasteRepository pasteRepository)
        {
            _pasteRepository = pasteRepository;
        }

        [HttpPost]
        public async Task<IActionResult> CreatePaste([FromBody] Paste paste)
        {
            paste.Id = Guid.NewGuid();
            paste.CreatedAt = DateTime.UtcNow.ToUnixEpoch(); // Use the extension method
            paste.DeleteToken = Guid.NewGuid().ToString();

            await _pasteRepository.CreatePasteAsync(paste);

            return Ok(new { pasteId = paste.Id, deleteToken = paste.DeleteToken });
        }

        [HttpGet("{pasteId}")]
        public async Task<IActionResult> GetPaste(Guid pasteId)
        {
            var paste = await _pasteRepository.GetPasteAsync(pasteId);
            if (paste == null)
            {
                return NotFound();
            }

            return Ok(paste);
        }

        [HttpDelete("{pasteId}")]
        public async Task<IActionResult> DeletePaste(Guid pasteId, [FromHeader(Name = "Delete-Token")] string deleteToken)
        {
            var paste = await _pasteRepository.GetPasteAsync(pasteId);
            if (paste == null)
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
            if (paste == null)
            {
                return NotFound();
            }

            return Content(paste.Content, "text/plain");
        }
    }
}