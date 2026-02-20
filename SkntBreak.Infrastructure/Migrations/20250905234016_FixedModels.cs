using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Skntbreak.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class FixedModels : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Type",
                table: "Breaks");

            migrationBuilder.RenameColumn(
                name: "Type",
                table: "BreakChats",
                newName: "BreakNumber");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "BreakNumber",
                table: "BreakChats",
                newName: "Type");

            migrationBuilder.AddColumn<int>(
                name: "Type",
                table: "Breaks",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }
    }
}
