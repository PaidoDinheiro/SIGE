/*
  Warnings:

  - You are about to drop the column `atualizadoEm` on the `usuarios` table. All the data in the column will be lost.
  - You are about to drop the column `criadoEm` on the `usuarios` table. All the data in the column will be lost.
  - You are about to alter the column `nome` on the `usuarios` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(150)`.
  - You are about to alter the column `email` on the `usuarios` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(150)`.
  - Added the required column `updatedAt` to the `usuarios` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `usuarios` DROP COLUMN `atualizadoEm`,
    DROP COLUMN `criadoEm`,
    ADD COLUMN `ativo` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `deletedAt` DATETIME(3) NULL,
    ADD COLUMN `ultimoLogin` DATETIME(3) NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL,
    MODIFY `nome` VARCHAR(150) NOT NULL,
    MODIFY `email` VARCHAR(150) NOT NULL,
    MODIFY `senha` VARCHAR(255) NOT NULL,
    MODIFY `tipoUsuario` ENUM('ADMIN', 'SECRETARIA', 'TESOURARIA', 'PROFESSOR', 'ALUNO', 'ENCARREGADO') NOT NULL;

-- CreateTable
CREATE TABLE `configuracoes_escola` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(200) NOT NULL,
    `endereco` VARCHAR(255) NULL,
    `telefone` VARCHAR(30) NULL,
    `email` VARCHAR(150) NULL,
    `website` VARCHAR(150) NULL,
    `diretor` VARCHAR(150) NOT NULL,
    `anoLetivoAtivo` VARCHAR(9) NOT NULL,
    `numeroTrimestres` INTEGER NOT NULL DEFAULT 3,
    `notaMinimaAprovacao` DECIMAL(4, 2) NOT NULL DEFAULT 10.00,
    `valorPropina` DECIMAL(10, 2) NOT NULL DEFAULT 1200.00,
    `banco` VARCHAR(100) NULL,
    `contaBancaria` VARCHAR(50) NULL,
    `nib` VARCHAR(50) NULL,
    `logoUrl` VARCHAR(255) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `alunos` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `usuarioId` INTEGER NOT NULL,
    `numeroBI` VARCHAR(30) NOT NULL,
    `dataNascimento` DATETIME(3) NOT NULL,
    `contacto` VARCHAR(30) NULL,
    `nomeEncarregado` VARCHAR(150) NOT NULL,
    `contactoEncarregado` VARCHAR(30) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    UNIQUE INDEX `alunos_usuarioId_key`(`usuarioId`),
    UNIQUE INDEX `alunos_numeroBI_key`(`numeroBI`),
    INDEX `alunos_deletedAt_idx`(`deletedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `turmas` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(100) NOT NULL,
    `anoLetivo` VARCHAR(9) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    INDEX `turmas_anoLetivo_idx`(`anoLetivo`),
    INDEX `turmas_deletedAt_idx`(`deletedAt`),
    UNIQUE INDEX `turmas_nome_anoLetivo_key`(`nome`, `anoLetivo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `disciplinas` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(100) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    UNIQUE INDEX `disciplinas_nome_key`(`nome`),
    INDEX `disciplinas_deletedAt_idx`(`deletedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `matriculas` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `alunoId` INTEGER NOT NULL,
    `turmaId` INTEGER NOT NULL,
    `anoLetivo` VARCHAR(9) NOT NULL,
    `dataMatricula` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `status` ENUM('ATIVA', 'TRANSFERIDA', 'CONCLUIDA', 'CANCELADA') NOT NULL DEFAULT 'ATIVA',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    INDEX `matriculas_turmaId_idx`(`turmaId`),
    INDEX `matriculas_anoLetivo_idx`(`anoLetivo`),
    INDEX `matriculas_status_idx`(`status`),
    INDEX `matriculas_deletedAt_idx`(`deletedAt`),
    UNIQUE INDEX `matriculas_alunoId_anoLetivo_key`(`alunoId`, `anoLetivo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `turma_disciplinas` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `turmaId` INTEGER NOT NULL,
    `disciplinaId` INTEGER NOT NULL,
    `professorId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    INDEX `turma_disciplinas_professorId_idx`(`professorId`),
    INDEX `turma_disciplinas_disciplinaId_idx`(`disciplinaId`),
    INDEX `turma_disciplinas_deletedAt_idx`(`deletedAt`),
    UNIQUE INDEX `turma_disciplinas_turmaId_disciplinaId_key`(`turmaId`, `disciplinaId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notas` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `alunoId` INTEGER NOT NULL,
    `matriculaId` INTEGER NOT NULL,
    `turmaDisciplinaId` INTEGER NOT NULL,
    `trimestre` INTEGER NOT NULL,
    `anoLetivo` VARCHAR(9) NOT NULL,
    `acs1` DECIMAL(4, 2) NOT NULL,
    `acs2` DECIMAL(4, 2) NOT NULL,
    `acp` DECIMAL(4, 2) NOT NULL,
    `media` DECIMAL(4, 2) NOT NULL,
    `situacao` ENUM('APROVADO', 'EM_EXAME', 'REPROVADO') NOT NULL,
    `disciplinaId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `notas_matriculaId_idx`(`matriculaId`),
    INDEX `notas_turmaDisciplinaId_idx`(`turmaDisciplinaId`),
    INDEX `notas_disciplinaId_idx`(`disciplinaId`),
    INDEX `notas_anoLetivo_idx`(`anoLetivo`),
    UNIQUE INDEX `notas_alunoId_turmaDisciplinaId_trimestre_anoLetivo_key`(`alunoId`, `turmaDisciplinaId`, `trimestre`, `anoLetivo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `faltas` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `alunoId` INTEGER NOT NULL,
    `matriculaId` INTEGER NOT NULL,
    `turmaDisciplinaId` INTEGER NOT NULL,
    `data` DATETIME(3) NOT NULL,
    `tipo` ENUM('JUSTIFICADA', 'INJUSTIFICADA') NOT NULL,
    `observacao` VARCHAR(255) NULL,
    `disciplinaId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `faltas_alunoId_idx`(`alunoId`),
    INDEX `faltas_matriculaId_idx`(`matriculaId`),
    INDEX `faltas_turmaDisciplinaId_idx`(`turmaDisciplinaId`),
    INDEX `faltas_disciplinaId_idx`(`disciplinaId`),
    INDEX `faltas_data_idx`(`data`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pagamentos` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `alunoId` INTEGER NOT NULL,
    `mesReferencia` VARCHAR(7) NOT NULL,
    `anoLetivo` VARCHAR(9) NOT NULL,
    `valor` DECIMAL(10, 2) NOT NULL,
    `status` ENUM('PAGO', 'PENDENTE', 'ATRASADO', 'CANCELADO') NOT NULL DEFAULT 'PENDENTE',
    `metodoPagamento` ENUM('CAIXA', 'TRANSFERENCIA', 'DEPOSITO') NULL,
    `dataPagamento` DATETIME(3) NULL,
    `referenciaPagamento` VARCHAR(100) NULL,
    `observacao` VARCHAR(255) NULL,
    `responsavelId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    INDEX `pagamentos_anoLetivo_idx`(`anoLetivo`),
    INDEX `pagamentos_status_idx`(`status`),
    INDEX `pagamentos_responsavelId_idx`(`responsavelId`),
    INDEX `pagamentos_deletedAt_idx`(`deletedAt`),
    UNIQUE INDEX `pagamentos_alunoId_mesReferencia_key`(`alunoId`, `mesReferencia`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `recibos` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `pagamentoId` INTEGER NOT NULL,
    `numero` VARCHAR(30) NOT NULL,
    `emitidoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `recibos_pagamentoId_key`(`pagamentoId`),
    UNIQUE INDEX `recibos_numero_key`(`numero`),
    INDEX `recibos_emitidoEm_idx`(`emitidoEm`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `avisos` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `titulo` VARCHAR(150) NOT NULL,
    `conteudo` TEXT NOT NULL,
    `autorId` INTEGER NOT NULL,
    `publicadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    INDEX `avisos_autorId_idx`(`autorId`),
    INDEX `avisos_deletedAt_idx`(`deletedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `auditorias` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `usuarioId` INTEGER NULL,
    `acao` ENUM('CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'PAYMENT', 'GENERATE_RECEIPT') NOT NULL,
    `entidade` VARCHAR(100) NOT NULL,
    `entidadeId` INTEGER NULL,
    `dadosAnteriores` JSON NULL,
    `dadosNovos` JSON NULL,
    `ip` VARCHAR(45) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `auditorias_usuarioId_idx`(`usuarioId`),
    INDEX `auditorias_entidade_idx`(`entidade`),
    INDEX `auditorias_entidadeId_idx`(`entidadeId`),
    INDEX `auditorias_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `usuarios_tipoUsuario_idx` ON `usuarios`(`tipoUsuario`);

-- CreateIndex
CREATE INDEX `usuarios_ativo_idx` ON `usuarios`(`ativo`);

-- CreateIndex
CREATE INDEX `usuarios_deletedAt_idx` ON `usuarios`(`deletedAt`);

-- AddForeignKey
ALTER TABLE `alunos` ADD CONSTRAINT `alunos_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `usuarios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `matriculas` ADD CONSTRAINT `matriculas_alunoId_fkey` FOREIGN KEY (`alunoId`) REFERENCES `alunos`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `matriculas` ADD CONSTRAINT `matriculas_turmaId_fkey` FOREIGN KEY (`turmaId`) REFERENCES `turmas`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `turma_disciplinas` ADD CONSTRAINT `turma_disciplinas_turmaId_fkey` FOREIGN KEY (`turmaId`) REFERENCES `turmas`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `turma_disciplinas` ADD CONSTRAINT `turma_disciplinas_disciplinaId_fkey` FOREIGN KEY (`disciplinaId`) REFERENCES `disciplinas`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `turma_disciplinas` ADD CONSTRAINT `turma_disciplinas_professorId_fkey` FOREIGN KEY (`professorId`) REFERENCES `usuarios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notas` ADD CONSTRAINT `notas_alunoId_fkey` FOREIGN KEY (`alunoId`) REFERENCES `alunos`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notas` ADD CONSTRAINT `notas_matriculaId_fkey` FOREIGN KEY (`matriculaId`) REFERENCES `matriculas`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notas` ADD CONSTRAINT `notas_turmaDisciplinaId_fkey` FOREIGN KEY (`turmaDisciplinaId`) REFERENCES `turma_disciplinas`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notas` ADD CONSTRAINT `notas_disciplinaId_fkey` FOREIGN KEY (`disciplinaId`) REFERENCES `disciplinas`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `faltas` ADD CONSTRAINT `faltas_alunoId_fkey` FOREIGN KEY (`alunoId`) REFERENCES `alunos`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `faltas` ADD CONSTRAINT `faltas_matriculaId_fkey` FOREIGN KEY (`matriculaId`) REFERENCES `matriculas`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `faltas` ADD CONSTRAINT `faltas_turmaDisciplinaId_fkey` FOREIGN KEY (`turmaDisciplinaId`) REFERENCES `turma_disciplinas`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `faltas` ADD CONSTRAINT `faltas_disciplinaId_fkey` FOREIGN KEY (`disciplinaId`) REFERENCES `disciplinas`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pagamentos` ADD CONSTRAINT `pagamentos_alunoId_fkey` FOREIGN KEY (`alunoId`) REFERENCES `alunos`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pagamentos` ADD CONSTRAINT `pagamentos_responsavelId_fkey` FOREIGN KEY (`responsavelId`) REFERENCES `usuarios`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `recibos` ADD CONSTRAINT `recibos_pagamentoId_fkey` FOREIGN KEY (`pagamentoId`) REFERENCES `pagamentos`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `avisos` ADD CONSTRAINT `avisos_autorId_fkey` FOREIGN KEY (`autorId`) REFERENCES `usuarios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `auditorias` ADD CONSTRAINT `auditorias_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `usuarios`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
