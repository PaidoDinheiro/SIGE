import { AvisoRepository } from "../repositories/AvisoRepository";
import { AuditoriaService } from "@/src/modules/auditoria/services/AuditoriaService";

export class AvisoService {
  static async listarAvisos(includeDeleted = false) {
    return AvisoRepository.findMany(includeDeleted);
  }

  static async criarAviso(data: { titulo: string; conteudo: string; autorId: number }) {
    const aviso = await AvisoRepository.create(data);
    
    await AuditoriaService.registarOperacao(
      "CREATE",
      "Aviso",
      aviso.id,
      null,
      aviso,
      data.autorId
    );

    return aviso;
  }

  static async atualizarAviso(id: number, data: { titulo: string; conteudo: string }, usuarioId: number) {
    const antigo = await AvisoRepository.findById(id);
    if (!antigo) throw new Error("Aviso não encontrado.");

    const aviso = await AvisoRepository.update(id, data);

    await AuditoriaService.registarOperacao(
      "UPDATE",
      "Aviso",
      aviso.id,
      antigo,
      aviso,
      usuarioId
    );

    return aviso;
  }

  static async eliminarAviso(id: number, usuarioId: number) {
    const antigo = await AvisoRepository.findById(id);
    if (!antigo) throw new Error("Aviso não encontrado.");

    const aviso = await AvisoRepository.softDelete(id);

    await AuditoriaService.registarOperacao(
      "DELETE",
      "Aviso",
      aviso.id,
      antigo,
      aviso,
      usuarioId
    );

    return aviso;
  }
}
