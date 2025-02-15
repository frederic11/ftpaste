namespace FTPaste.Models
{
    public class GetPasteResponse
    {
        public Guid Id { get; set; }
        public required string Content { get; set; }
    }
}