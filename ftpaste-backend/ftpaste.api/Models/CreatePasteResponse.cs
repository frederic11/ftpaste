namespace FTPaste.Models
{
    public class CreatePasteResponse
    {
        public Guid PasteId { get; set; }
        public required string DeleteToken { get; set; }
    }
}