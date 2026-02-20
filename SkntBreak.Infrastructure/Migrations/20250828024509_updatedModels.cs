using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Skntbreak.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class updatedModels : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Breaks_Users_UserId",
                table: "Breaks");

            migrationBuilder.DropForeignKey(
                name: "FK_Users_Schedules_ScheduleId",
                table: "Users");

            migrationBuilder.DropTable(
                name: "BreakRules");

            migrationBuilder.DropIndex(
                name: "IX_Users_ScheduleId",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "ScheduleId",
                table: "Users");

            migrationBuilder.RenameColumn(
                name: "UserId",
                table: "Breaks",
                newName: "UserShiftId");

            migrationBuilder.RenameIndex(
                name: "IX_Breaks_UserId",
                table: "Breaks",
                newName: "IX_Breaks_UserShiftId");

            migrationBuilder.AddColumn<int>(
                name: "BreakNumber",
                table: "Breaks",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "DurationMinutes",
                table: "Breaks",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<DateTime>(
                name: "EndTime",
                table: "Breaks",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<DateOnly>(
                name: "WorkDate",
                table: "Breaks",
                type: "date",
                nullable: false,
                defaultValue: new DateOnly(1, 1, 1));

            migrationBuilder.AddColumn<bool>(
                name: "IsReserved",
                table: "BreakChats",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.CreateTable(
                name: "BreakPoolDays",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Group = table.Column<int>(type: "integer", nullable: false),
                    WorkDate = table.Column<DateOnly>(type: "date", nullable: false),
                    TotalBreaks = table.Column<int>(type: "integer", nullable: false),
                    AvailableBreaks = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BreakPoolDays", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ShiftBreakTemplates",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ScheduleId = table.Column<int>(type: "integer", nullable: false),
                    Order = table.Column<int>(type: "integer", nullable: false),
                    DurationMinutes = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ShiftBreakTemplates", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ShiftBreakTemplates_Schedules_ScheduleId",
                        column: x => x.ScheduleId,
                        principalTable: "Schedules",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "UserShifts",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UserId = table.Column<int>(type: "integer", nullable: false),
                    ScheduleId = table.Column<int>(type: "integer", nullable: false),
                    WorkDate = table.Column<DateOnly>(type: "date", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserShifts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserShifts_Schedules_ScheduleId",
                        column: x => x.ScheduleId,
                        principalTable: "Schedules",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_UserShifts_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ShiftBreakTemplates_ScheduleId",
                table: "ShiftBreakTemplates",
                column: "ScheduleId");

            migrationBuilder.CreateIndex(
                name: "IX_UserShifts_ScheduleId",
                table: "UserShifts",
                column: "ScheduleId");

            migrationBuilder.CreateIndex(
                name: "IX_UserShifts_UserId_WorkDate",
                table: "UserShifts",
                columns: new[] { "UserId", "WorkDate" },
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Breaks_UserShifts_UserShiftId",
                table: "Breaks",
                column: "UserShiftId",
                principalTable: "UserShifts",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Breaks_UserShifts_UserShiftId",
                table: "Breaks");

            migrationBuilder.DropTable(
                name: "BreakPoolDays");

            migrationBuilder.DropTable(
                name: "ShiftBreakTemplates");

            migrationBuilder.DropTable(
                name: "UserShifts");

            migrationBuilder.DropColumn(
                name: "BreakNumber",
                table: "Breaks");

            migrationBuilder.DropColumn(
                name: "DurationMinutes",
                table: "Breaks");

            migrationBuilder.DropColumn(
                name: "EndTime",
                table: "Breaks");

            migrationBuilder.DropColumn(
                name: "WorkDate",
                table: "Breaks");

            migrationBuilder.DropColumn(
                name: "IsReserved",
                table: "BreakChats");

            migrationBuilder.RenameColumn(
                name: "UserShiftId",
                table: "Breaks",
                newName: "UserId");

            migrationBuilder.RenameIndex(
                name: "IX_Breaks_UserShiftId",
                table: "Breaks",
                newName: "IX_Breaks_UserId");

            migrationBuilder.AddColumn<int>(
                name: "ScheduleId",
                table: "Users",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "BreakRules",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ScheduleId = table.Column<int>(type: "integer", nullable: false),
                    MaxCount = table.Column<int>(type: "integer", nullable: false),
                    Type = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BreakRules", x => x.Id);
                    table.ForeignKey(
                        name: "FK_BreakRules_Schedules_ScheduleId",
                        column: x => x.ScheduleId,
                        principalTable: "Schedules",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Users_ScheduleId",
                table: "Users",
                column: "ScheduleId");

            migrationBuilder.CreateIndex(
                name: "IX_BreakRules_ScheduleId",
                table: "BreakRules",
                column: "ScheduleId");

            migrationBuilder.AddForeignKey(
                name: "FK_Breaks_Users_UserId",
                table: "Breaks",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Users_Schedules_ScheduleId",
                table: "Users",
                column: "ScheduleId",
                principalTable: "Schedules",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
