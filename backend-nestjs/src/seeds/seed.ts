import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module.js';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../modules/cep/entities/category.entity.js';
import { Specialty } from '../modules/cep/entities/specialty.entity.js';
import { Area } from '../modules/areas/entities/area.entity.js';
import { AreaSpecialty } from '../modules/areas/entities/area-specialty.entity.js';
import { IntegrationLink } from '../modules/integration/entities/integration-link.entity.js';
import { readFileSync } from 'fs';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const categoryRepo = app.get<Repository<Category>>(
    getRepositoryToken(Category),
  );
  const specialtyRepo = app.get<Repository<Specialty>>(
    getRepositoryToken(Specialty),
  );
  const areaRepo = app.get<Repository<Area>>(getRepositoryToken(Area));
  const areaSpecialtyRepo = app.get<Repository<AreaSpecialty>>(
    getRepositoryToken(AreaSpecialty),
  );
  const linkRepo = app.get<Repository<IntegrationLink>>(
    getRepositoryToken(IntegrationLink),
  );

  console.log('Seeding database...');

  // --- Seed CEP ---
  try {
    const manifestPath = join(
      process.cwd(),
      '../backend/files/cep/manifest.json',
    );
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
    console.log(`Loading ${manifest.categorias.length} CEP categories...`);

    for (const catData of manifest.categorias) {
      let category = await categoryRepo.findOne({
        where: { code: catData.codigo_categoria },
      });
      if (!category) {
        category = categoryRepo.create({
          code: catData.codigo_categoria,
          name: catData.nombre_categoria,
          slug: catData.slug,
          pdfOrigin: catData.pdf_origen,
        });
        await categoryRepo.save(category);
      }

      const items = catData.items || [];
      for (const itemData of items) {
        let specialty = await specialtyRepo.findOne({
          where: { code: itemData.codigo },
        });
        if (!specialty) {
          specialty = specialtyRepo.create({
            code: itemData.codigo,
            name: itemData.nombre,
            slug: itemData.slug,
            pageStart: itemData.pag_inicio,
            pageEnd: itemData.pag_fin,
            pdfPath: itemData.pdf,
            category, // Association
          });
          await specialtyRepo.save(specialty);
        }
      }
    }
    console.log('CEP data seeded.');
  } catch (err) {
    console.error('Error seeding CEP:', err);
  }

  // --- Seed Areas ---
  try {
    const areasPath = join(process.cwd(), '../backend/especialidades.json');
    const areasData = JSON.parse(readFileSync(areasPath, 'utf8'));
    console.log(`Loading ${areasData.length} Areas...`);

    for (const areaData of areasData) {
      let area = await areaRepo.findOne({ where: { slug: areaData.slug } });
      if (!area) {
        area = areaRepo.create({
          name: areaData.name,
          slug: areaData.slug,
          img: areaData.img,
        });
        await areaRepo.save(area);
      }

      const items = areaData.items || [];
      for (const itemData of items) {
        let areaSpecialty = await areaSpecialtyRepo.findOne({
          where: { slug: itemData.slug, area: { id: area.id } },
          relations: ['area'],
        });

        if (!areaSpecialty) {
          areaSpecialty = areaSpecialtyRepo.create({
            name: itemData.name,
            slug: itemData.slug,
            img: itemData.img,
            pdf: itemData.pdf,
            area, // Association
          });
          await areaSpecialtyRepo.save(areaSpecialty);
        }
      }
    }
    console.log('Areas data seeded.');
  } catch (err) {
    console.error('Error seeding Areas:', err);
  }

  // --- Seed Integration Links ---
  try {
    const linksPath = join(
      process.cwd(),
      '../backend/files/integration/links.json',
    );
    try {
      const linksData = JSON.parse(readFileSync(linksPath, 'utf8'));
      console.log(`Loading ${linksData.links.length} Integration Links...`);

      for (const linkData of linksData.links) {
        let link = await linkRepo.findOne({ where: { cepId: linkData.cepId } });
        if (!link) {
          link = linkRepo.create({
            cepId: linkData.cepId,
            specialtyId: linkData.specialtyId,
            status: linkData.status,
            source: linkData.source,
            note: linkData.note,
          });
          await linkRepo.save(link);
        }
      }
      console.log('Integration Links seeded.');
    } catch (readErr) {
      if (readErr.code === 'ENOENT') {
        console.log('No integration links file found, skipping.');
      } else {
        throw readErr;
      }
    }
  } catch (err) {
    console.error('Error seeding Integration Links:', err);
  }

  await app.close();
  console.log('Seeding complete.');
}

bootstrap();
