import { PrismaService } from '../prisma/prisma.service';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<{
        id: number;
        createdAt: Date;
        email: string;
        nickname: string;
        role: import("@prisma/client").$Enums.Role;
    }[]>;
}
