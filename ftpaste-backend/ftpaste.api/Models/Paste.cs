using System.ComponentModel.DataAnnotations;

namespace FTPaste.Models
{
    public class Paste
    {
        public const int MaxContentLength = 10 * 1024 * 1024; // 10MB in characters

        [Key]
        public Guid Id { get; set; }

        [Required(ErrorMessage = "Content is required")]
        [MaxLength(MaxContentLength, ErrorMessage = "Content exceeds maximum allowed size of 10MB")]
        public string Content { get; set; } = string.Empty;

        [Required]
        [Range(0, long.MaxValue, ErrorMessage = "CreatedAt must be a valid Unix timestamp")]
        public long CreatedAt { get; set; }

        [Range(0, long.MaxValue, ErrorMessage = "ExpiresAt must be a valid Unix timestamp")]
        public long? ExpiresAt { get; set; }

        [StringLength(36, ErrorMessage = "DeleteToken must be a valid GUID string")]
        public string? DeleteToken { get; set; }

        [Required(ErrorMessage = "Language is required")]
        [StringLength(50, ErrorMessage = "Language name cannot exceed 50 characters")]
        public string Language { get; set; } = "plaintext";
    }
}