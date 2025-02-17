using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ftpaste.api.Migrations
{
    /// <inheritdoc />
    public partial class AddLanguageField : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Language",
                table: "Pastes",
                type: "text",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Language",
                table: "Pastes");
        }
    }
}
