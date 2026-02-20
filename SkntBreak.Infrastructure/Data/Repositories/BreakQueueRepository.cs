using Microsoft.EntityFrameworkCore;
using Skntbreak.Core.Entities;
using Skntbreak.Core.Enums;
using Skntbreak.Core.Interfaces;
using SkntBreak.Infrastructure.Data;

namespace Skntbreak.Infrastructure.Data.Repositories
{
    public class BreakQueueRepository : IBreakQueueRepository
    {
        private readonly SkntbreakDbContext _context;

        public BreakQueueRepository(SkntbreakDbContext context)
        {
            _context = context;
        }

        public async Task<BreakQueue?> GetByIdAsync(int id)
        {
            return await _context.BreakQueues
                .Include(q => q.UserShift)
                    .ThenInclude(us => us.User)
                .Include(q => q.UserShift)
                    .ThenInclude(us => us.Schedule)
                .FirstOrDefaultAsync(q => q.Id == id);
        }

        public async Task<List<BreakQueue>> GetQueueAsync(
            DateOnly workDate, ShiftType group, int breakRound)
        {
            return await _context.BreakQueues
                .Include(q => q.UserShift)
                    .ThenInclude(us => us.User)
                .Include(q => q.UserShift)
                    .ThenInclude(us => us.Schedule)
                .Where(q => q.WorkDate == workDate
                         && q.Group == group
                         && q.BreakRound == breakRound)
                .OrderBy(q => q.Position)
                .ToListAsync();
        }

        public async Task<BreakQueue?> GetUserEntryAsync(int userShiftId, int breakRound)
        {
            return await _context.BreakQueues
                .Include(q => q.UserShift)
                    .ThenInclude(us => us.User)
                .Where(q => q.UserShiftId == userShiftId
                         && q.BreakRound == breakRound
                         && q.Status != QueueStatus.Cancelled
                         && q.Status != QueueStatus.Expired)
                .FirstOrDefaultAsync();
        }

        public async Task<BreakQueue?> GetNextWaitingAsync(
            DateOnly workDate, ShiftType group, int breakRound)
        {
            return await _context.BreakQueues
                .Include(q => q.UserShift)
                    .ThenInclude(us => us.User)
                .Where(q => q.WorkDate == workDate
                         && q.Group == group
                         && q.BreakRound == breakRound
                         && q.Status == QueueStatus.Waiting)
                .OrderBy(q => q.Position)
                .FirstOrDefaultAsync();
        }

        public async Task<int> GetMaxPositionAsync(
            DateOnly workDate, ShiftType group, int breakRound)
        {
            var maxPos = await _context.BreakQueues
                .Where(q => q.WorkDate == workDate
                         && q.Group == group
                         && q.BreakRound == breakRound
                         && q.Status != QueueStatus.Cancelled)
                .MaxAsync(q => (int?)q.Position);

            return maxPos ?? 0;
        }

        public async Task<bool> IsRoundCompleteAsync(
            DateOnly workDate, ShiftType group, int breakRound, int totalUsersInShift)
        {
            // Считаем сколько людей завершили или скипнули этот раунд
            var completedCount = await _context.Breaks
                .Where(b => b.WorkDate == workDate
                         && b.UserShift.Group == group
                         && b.BreakNumber == breakRound
                         && (b.Status == BreakStatus.Finished || b.Status == BreakStatus.Skipped))
                .Select(b => b.UserShift.UserId)
                .Distinct()
                .CountAsync();

            return completedCount >= totalUsersInShift;
        }

        public async Task<List<BreakQueue>> GetExpiredNotificationsAsync(TimeSpan timeout)
        {
            var cutoff = DateTime.UtcNow - timeout;
            return await _context.BreakQueues
                .Include(q => q.UserShift)
                    .ThenInclude(us => us.User)
                .Where(q => q.Status == QueueStatus.Notified
                         && q.NotifiedAt != null
                         && q.NotifiedAt < cutoff)
                .ToListAsync();
        }

        public async Task<BreakQueue> AddAsync(BreakQueue entry)
        {
            _context.BreakQueues.Add(entry);
            await _context.SaveChangesAsync();
            return entry;
        }

        public async Task UpdateAsync(BreakQueue entry)
        {
            _context.BreakQueues.Update(entry);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateRangeAsync(IEnumerable<BreakQueue> entries)
        {
            _context.BreakQueues.UpdateRange(entries);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var entry = await _context.BreakQueues.FindAsync(id);
            if (entry != null)
            {
                _context.BreakQueues.Remove(entry);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<int> CountActiveInRoundAsync(
            DateOnly workDate, ShiftType group, int breakRound)
        {
            return await _context.BreakQueues
                .CountAsync(q => q.WorkDate == workDate
                              && q.Group == group
                              && q.BreakRound == breakRound
                              && (q.Status == QueueStatus.Waiting
                               || q.Status == QueueStatus.Notified));
        }

        public async Task<bool> HasNotifiedEntryAsync(
            DateOnly workDate, ShiftType group, int breakRound)
        {
            return await _context.BreakQueues
                .AnyAsync(q => q.WorkDate == workDate
                            && q.Group == group
                            && q.BreakRound == breakRound
                            && q.Status == QueueStatus.Notified);
        }
    }
}
