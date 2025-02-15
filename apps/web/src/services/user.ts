import { prisma } from '@/lib/prisma'
import { hash } from 'bcryptjs'

export type CreateUserInput = {
    email: string
    name: string
    password: string
}

export async function createUser(input: CreateUserInput) {
    const hashedPassword = await hash(input.password, 12)

    // トランザクション内でユーザーとプライベートグループを作成
    const user = await prisma.$transaction(async (tx) => {
        // ユーザーの作成
        const user = await tx.user.create({
            data: {
                email: input.email,
                name: input.name,
                password: hashedPassword,
            },
        })

        // プライベートグループの作成
        await tx.group.create({
            data: {
                name: `${user.name}'s Private Photos`,
                description: 'My personal photo collection',
                isPrivate: true,
                members: {
                    create: {
                        userId: user.id,
                        role: 'ADMIN',
                    },
                },
            },
        })

        return user
    })

    return user
}

export async function getUserPrivateGroup(userId: string) {
    return prisma.group.findFirst({
        where: {
            isPrivate: true,
            members: {
                some: {
                    userId,
                    role: 'ADMIN',
                },
            },
        },
        include: {
            members: true,
            albums: true,
        },
    })
}
