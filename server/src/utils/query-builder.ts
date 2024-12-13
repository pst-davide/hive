import {ObjectLiteral, SelectQueryBuilder} from 'typeorm';

export interface QueryCondition {
    field: string;
    operator: string;
    value: any;
}

export function buildQuery<Entity extends ObjectLiteral>(
    queryBuilder: SelectQueryBuilder<Entity>,
    conditions: QueryCondition[]
): SelectQueryBuilder<Entity> {
    conditions.forEach(({ field, operator, value }) => {
        switch (operator) {
            case '=':
                queryBuilder.andWhere(`${field} = :${field}`, { [field]: value });
                break;
            case '>':
                queryBuilder.andWhere(`${field} > :${field}`, { [field]: value });
                break;
            case '<':
                queryBuilder.andWhere(`${field} < :${field}`, { [field]: value });
                break;
            case 'LIKE':
                queryBuilder.andWhere(`${field} LIKE :${field}`, { [field]: `%${value}%` });
                break;
            case 'IN':
                queryBuilder.andWhere(`${field} IN (:...${field})`, { [field]: value });
                break;
            // Aggiungi altri casi per operatori personalizzati...
            default:
                throw new Error(`Operator ${operator} not supported`);
        }
    });

    return queryBuilder;
}
