using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Skntbreak.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddShiftTimingFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "EndedAt",
                table: "UserShifts",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "StartedAt",
                table: "UserShifts",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "EndedAt",
                table: "UserShifts");

            migrationBuilder.DropColumn(
                name: "StartedAt",
                table: "UserShifts");
        }
    }
}
