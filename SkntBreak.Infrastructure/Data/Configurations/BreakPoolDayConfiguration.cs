using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Skntbreak.Core.Entities;

namespace Skntbreak.Infrastructure.Data.Configurations
{
    public class BreakPoolDayConfiguration : IEntityTypeConfiguration<BreakPoolDay>
    {
        public void Configure(EntityTypeBuilder<BreakPoolDay> builder)
        {
            builder.HasKey(bpd => bpd.Id);
            builder.Property(bpd => bpd.WorkDate).IsRequired();
            builder.Property(bpd => bpd.Group).IsRequired();

            // Исправленная строка: используем стандартный метод IsRowVersion() 
            // Npgsql автоматически свяжет это поле типа uint с системной колонкой xmin в PostgreSQL
            builder.Property(bpd => bpd.Version).IsRowVersion();
        }
    }
}