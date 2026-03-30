import { UsersService } from '../users/users.service';
export declare class AdminController {
    private usersService;
    constructor(usersService: UsersService);
    getUsers(): Promise<{
        id: number;
        createdAt: Date;
        email: string;
        nickname: string;
        role: import("@prisma/client").$Enums.Role;
    }[]>;
}
