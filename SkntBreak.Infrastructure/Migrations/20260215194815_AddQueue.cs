using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Skntbreak.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddQueue : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "AllowDurationChoice",
                table: "Schedules",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "Remaining10MinBreaks",
                table: "BreakPoolDays",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Remaining20MinBreaks",
                table: "BreakPoolDays",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Total10MinBreaks",
                table: "BreakPoolDays",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Total20MinBreaks",
                table: "BreakPoolDays",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "BreakQueues",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    WorkDate = table.Column<DateOnly>(type: "date", nullable: false),
                    Group = table.Column<int>(type: "integer", nullable: false),
                    BreakRound = table.Column<int>(type: "integer", nullable: false),
                    Position = table.Column<int>(type: "integer", nullable: false),
                    UserShiftId = table.Column<int>(type: "integer", nullable: false),
                    DurationMinutes = table.Column<int>(type: "integer", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    EnqueuedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    NotifiedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsPriority = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BreakQueues", x => x.Id);
                    table.ForeignKey(
                        name: "FK_BreakQueues_UserShifts_UserShiftId",
                        column: x => x.UserShiftId,
                        principalTable: "UserShifts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_BreakQueues_Status_NotifiedAt",
                table: "BreakQueues",
                columns: new[] { "Status", "NotifiedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_BreakQueues_UserShiftId",
                table: "BreakQueues",
                column: "UserShiftId");

            migrationBuilder.CreateIndex(
                name: "IX_BreakQueues_WorkDate_Group_Round_Pos",
                table: "BreakQueues",
                columns: new[] { "WorkDate", "Group", "BreakRound", "Position" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "BreakQueues");

            migrationBuilder.DropColumn(
                name: "AllowDurationChoice",
                table: "Schedules");

            migrationBuilder.DropColumn(
                name: "Remaining10MinBreaks",
                table: "BreakPoolDays");

            migrationBuilder.DropColumn(
                name: "Remaining20MinBreaks",
                table: "BreakPoolDays");

            migrationBuilder.DropColumn(
                name: "Total10MinBreaks",
                table: "BreakPoolDays");

            migrationBuilder.DropColumn(
                name: "Total20MinBreaks",
                table: "BreakPoolDays");
        }
    }
}
