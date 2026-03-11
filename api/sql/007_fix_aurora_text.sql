UPDATE salons
SET name = 'Salão Aurora',
    tagline = 'Cortes modernos, luz natural e experiência premium.'
WHERE slug = 'aurora';

UPDATE loyalty_rules
SET reward_description = 'Ganhe 1 ponto por corte. A cada 10, um serviço grátis.'
WHERE salon_id = 'salon_aurora';
