using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ResumeAPI.Migrations
{
    /// <inheritdoc />
    public partial class JobDescriptionAndUserNotes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "JobDescription",
                table: "Documents",
                type: "character varying(4000)",
                maxLength: 4000,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "UserNotes",
                table: "Documents",
                type: "character varying(4000)",
                maxLength: 4000,
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "JobDescription",
                table: "Documents");

            migrationBuilder.DropColumn(
                name: "UserNotes",
                table: "Documents");
        }
    }
}
