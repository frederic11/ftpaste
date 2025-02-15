using FTPaste.Models;
using FTPaste.Api.Data;

namespace FTPaste.Repositories
{
    public class PasteRepository : IPasteRepository
    {
        private readonly AppDbContext _context;

        public PasteRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task CreatePasteAsync(Paste paste)
        {
            _context.Pastes.Add(paste);
            await _context.SaveChangesAsync();
        }

        public async Task<Paste?> GetPasteAsync(Guid pasteId)
        {
            return await _context.Pastes.FindAsync(pasteId);
        }

        public async Task DeletePasteAsync(Guid pasteId)
        {
            var paste = await _context.Pastes.FindAsync(pasteId);
            if (paste != null)
            {
                _context.Pastes.Remove(paste);
                await _context.SaveChangesAsync();
            }
        }
    }
}