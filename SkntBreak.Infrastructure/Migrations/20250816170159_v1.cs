using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Skntbreak.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class v1 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Breaks_Users_UserId1",
                table: "Breaks");

            migrationBuilder.DropForeignKey(
                name: "FK_Users_Schedules_ScheduleId",
                table: "Users");

            migrationBuilder.DropForeignKey(
                name: "FK_Users_Schedules_ScheduleId1",
                table: "Users");

            migrationBuilder.DropIndex(
                name: "IX_Users_ScheduleId1",
                table: "Users");

            migrationBuilder.DropIndex(
                name: "IX_Breaks_UserId1",
                table: "Breaks");

            migrationBuilder.DropColumn(
                name: "ScheduleId1",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "UserId1",
                table: "Breaks");

            migrationBuilder.AddForeignKey(
                name: "FK_Users_Schedules_ScheduleId",
                table: "Users",
                column: "ScheduleId",
                principalTable: "Schedules",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Users_Schedules_ScheduleId",
                table: "Users");

            migrationBuilder.AddColumn<int>(
                name: "ScheduleId1",
                table: "Users",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "UserId1",
                table: "Breaks",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Users_ScheduleId1",
                table: "Users",
                column: "ScheduleId1");

            migrationBuilder.CreateIndex(
                name: "IX_Breaks_UserId1",
                table: "Breaks",
                column: "UserId1");

            migrationBuilder.AddForeignKey(
                name: "FK_Breaks_Users_UserId1",
                table: "Breaks",
                column: "UserId1",
                principalTable: "Users",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Users_Schedules_ScheduleId",
                table: "Users",
                column: "ScheduleId",
                principalTable: "Schedules",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Users_Schedules_ScheduleId1",
                table: "Users",
                column: "ScheduleId1",
                principalTable: "Schedules",
                principalColumn: "Id");
        }
    }
}
