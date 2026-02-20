using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Skntbreak.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddedGroup : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Group",
                table: "UserShifts",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Group",
                table: "UserShifts");
        }
    }
}
