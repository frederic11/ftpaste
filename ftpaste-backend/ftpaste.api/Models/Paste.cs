namespace FTPaste.Models
{
    public class Paste
    {
        public Guid Id { get; set; }
        public string Content { get; set; } = string.Empty;
        public long CreatedAt { get; set; } // Unix epoch time in seconds
        public long? ExpiresAt { get; set; } // Nullable, Unix epoch time
        public string? DeleteToken { get; set; }
    }
}