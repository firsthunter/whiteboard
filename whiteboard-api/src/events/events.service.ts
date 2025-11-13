import {
    Injectable,
    NotFoundException,
    ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createEventDto: CreateEventDto) {
    return this.prisma.event.create({
      data: {
        userId,
        title: createEventDto.title,
        description: createEventDto.description,
        type: createEventDto.type,
        startDate: new Date(createEventDto.startDate),
        endDate: createEventDto.endDate
          ? new Date(createEventDto.endDate)
          : null,
        location: createEventDto.location,
        courseId: createEventDto.courseId,
        isAllDay: createEventDto.isAllDay || false,
      },
      include: {
        course: {
          select: {
            id: true,
            code: true,
            title: true,
          },
        },
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async findAll(userId: string, startDate?: string, endDate?: string) {
    const where: any = { userId };

    if (startDate && endDate) {
      where.startDate = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    // Get user events
    const events = await this.prisma.event.findMany({
      where,
      include: {
        course: {
          select: {
            id: true,
            code: true,
            title: true,
          },
        },
      },
      orderBy: {
        startDate: 'asc',
      },
    });

    // Get user's enrolled courses
    const enrollments = await this.prisma.enrollment.findMany({
      where: { userId },
      select: { courseId: true },
    });

    const courseIds = enrollments.map((e) => e.courseId);

    // Get assignments from enrolled courses as calendar events
    const assignmentWhere: any = {
      courseId: { in: courseIds },
    };

    if (startDate && endDate) {
      assignmentWhere.dueDate = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    const assignments = await this.prisma.assignment.findMany({
      where: assignmentWhere,
      include: {
        course: {
          select: {
            id: true,
            code: true,
            title: true,
          },
        },
      },
      orderBy: {
        dueDate: 'asc',
      },
    });

    // Transform assignments to calendar event format
    const assignmentEvents = assignments.map((assignment) => ({
      id: assignment.id,
      userId: userId,
      title: assignment.title,
      description: assignment.description || null,
      type: 'ASSIGNMENT' as const,
      startDate: assignment.dueDate.toISOString(),
      endDate: assignment.dueDate.toISOString(),
      location: null,
      courseId: assignment.courseId,
      isAllDay: false,
      createdAt: assignment.createdAt.toISOString(),
      updatedAt: assignment.updatedAt.toISOString(),
      course: assignment.course,
      metadata: {
        assignmentId: assignment.id,
        maxPoints: assignment.maxPoints,
      },
    }));

    // Combine and sort all events
    return [...events, ...assignmentEvents].sort(
      (a, b) =>
        new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
    );
  }

  async findOne(id: string, userId: string) {
    const event = await this.prisma.event.findUnique({
      where: { id },
      include: {
        course: {
          select: {
            id: true,
            code: true,
            title: true,
          },
        },
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    if (event.userId !== userId) {
      throw new ForbiddenException('You can only view your own events');
    }

    return event;
  }

  async update(id: string, userId: string, updateEventDto: UpdateEventDto) {
    const event = await this.prisma.event.findUnique({
      where: { id },
    });

    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    if (event.userId !== userId) {
      throw new ForbiddenException('You can only update your own events');
    }

    const updateData: any = { ...updateEventDto };
    if (updateEventDto.startDate) {
      updateData.startDate = new Date(updateEventDto.startDate);
    }
    if (updateEventDto.endDate) {
      updateData.endDate = new Date(updateEventDto.endDate);
    }

    return this.prisma.event.update({
      where: { id },
      data: updateData,
      include: {
        course: {
          select: {
            id: true,
            code: true,
            title: true,
          },
        },
      },
    });
  }

  async remove(id: string, userId: string) {
    const event = await this.prisma.event.findUnique({
      where: { id },
    });

    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    if (event.userId !== userId) {
      throw new ForbiddenException('You can only delete your own events');
    }

    return this.prisma.event.delete({
      where: { id },
    });
  }
}
