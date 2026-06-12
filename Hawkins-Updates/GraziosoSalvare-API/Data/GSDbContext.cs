using Microsoft.EntityFrameworkCore;

namespace GraziosoSalvare.Data
{
    public class GSDbContext : DbContext
    {
        public GSDbContext(DbContextOptions<GSDbContext> options) : base(options)
        {
        }

        public DbSet<Animal> Animals { get; set; }
    }
}