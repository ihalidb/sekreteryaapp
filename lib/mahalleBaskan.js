/**
 * Mahalle–başkan ataması (ilçe teşkilatı havuzundan seçim).
 */
export const assignMahalleBaskan = async (prisma, mahalleId, assignment) => {
  if (assignment === undefined) {
    return null;
  }

  const clearMahalleAssignment = async (targetMahalleId) => {
    const current = await prisma.mahalleBaskan.findFirst({
      where: { mahalleId: targetMahalleId },
    });
    if (current) {
      await prisma.mahalleBaskan.update({
        where: { id: current.id },
        data: { mahalleId: null },
      });
    }
  };

  if (assignment === null || assignment.remove === true) {
    await clearMahalleAssignment(mahalleId);
    return null;
  }

  const baskanId = parseInt(assignment.baskanId, 10);
  if (!baskanId || Number.isNaN(baskanId)) {
    return null;
  }

  const baskan = await prisma.mahalleBaskan.findUnique({ where: { id: baskanId } });
  if (!baskan) {
    throw new Error('Mahalle başkanı bulunamadı');
  }

  await clearMahalleAssignment(mahalleId);

  return prisma.mahalleBaskan.update({
    where: { id: baskanId },
    data: { mahalleId },
    include: { mahalle: true },
  });
};

/** @deprecated Havuzdan atama için assignMahalleBaskan kullanın */
export const syncMahalleBaskan = async (prisma, mahalleId, baskan, userId = null) => {
  if (baskan === undefined) {
    return null;
  }

  if (baskan === null || baskan.remove === true) {
    return assignMahalleBaskan(prisma, mahalleId, { remove: true });
  }

  if (baskan.baskanId) {
    return assignMahalleBaskan(prisma, mahalleId, { baskanId: baskan.baskanId });
  }

  const ad = baskan.ad?.trim();
  const soyad = baskan.soyad?.trim();

  if (!ad || !soyad) {
    return assignMahalleBaskan(prisma, mahalleId, { remove: true });
  }

  const existing = await prisma.mahalleBaskan.findFirst({ where: { mahalleId } });

  if (existing) {
    return prisma.mahalleBaskan.update({
      where: { id: existing.id },
      data: {
        ad,
        soyad,
        telefon: baskan.telefon?.trim() || null,
        email: baskan.email?.trim() || null,
        adres: baskan.adres?.trim() || null,
      },
      include: { mahalle: true },
    });
  }

  return prisma.mahalleBaskan.create({
    data: {
      mahalleId,
      ad,
      soyad,
      telefon: baskan.telefon?.trim() || null,
      email: baskan.email?.trim() || null,
      adres: baskan.adres?.trim() || null,
      createdBy: userId,
    },
    include: { mahalle: true },
  });
};
