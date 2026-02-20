using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Skntbreak.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddShiftTypeToSchedule : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "ShiftType",
                table: "Schedules",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ShiftType",
                table: "Schedules");
        }
    }
}
