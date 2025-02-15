using FTPaste.Models;
using System;
using System.Threading.Tasks;

namespace FTPaste.Repositories
{
    public interface IPasteRepository
    {
        Task CreatePasteAsync(Paste paste);
        Task<Paste?> GetPasteAsync(Guid pasteId);
        Task DeletePasteAsync(Guid pasteId);
    }
}