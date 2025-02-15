using FTPaste.Models;
using Microsoft.EntityFrameworkCore;

namespace FTPaste.Api.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Paste> Pastes { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Optional: Any custom configurations here later
        }
    }
}
