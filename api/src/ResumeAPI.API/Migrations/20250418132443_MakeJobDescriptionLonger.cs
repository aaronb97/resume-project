using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ResumeAPI.Migrations
{
    /// <inheritdoc />
    public partial class MakeJobDescriptionLonger : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "JobDescription",
                table: "Documents",
                type: "character varying(16000)",
                maxLength: 16000,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(4000)",
                oldMaxLength: 4000);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "JobDescription",
                table: "Documents",
                type: "character varying(4000)",
                maxLength: 4000,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(16000)",
                oldMaxLength: 16000);
        }
    }
}
