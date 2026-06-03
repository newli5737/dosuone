import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from '../entities';
import { paginate, paginationMeta } from '../common/utils/pagination.util';

@Injectable()
export class NotificationsService {
  constructor(@InjectRepository(Notification) private repo: Repository<Notification>) {}

  async findAll(userId: string, page = 1, limit = 20) {
    const { skip, take, page: p, limit: l } = paginate(page, limit);
    const [data, total] = await this.repo.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip,
      take,
    });
    return { data, meta: paginationMeta(p, l, total) };
  }

  async markRead(userId: string, id: string) {
    const n = await this.repo.findOne({ where: { id, userId } });
    if (!n) throw new NotFoundException('Thông báo không tồn tại');
    n.isRead = true;
    return this.repo.save(n);
  }

  async markAllRead(userId: string) {
    await this.repo.update({ userId, isRead: false }, { isRead: true });
    return { message: 'Đã đánh dấu tất cả đã đọc' };
  }

  unreadCount(userId: string) {
    return this.repo.count({ where: { userId, isRead: false } }).then((count) => ({ count }));
  }
}
