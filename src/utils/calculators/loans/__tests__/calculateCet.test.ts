import { calculateCET } from "../cet";

describe("calculateCET", () => {
    it("deve calcular corretamente o CET anual de um financiamento padrão", () => {
        const financed = 10000;
        const schedule = Array(12).fill({ payment: 879.16 }); // 12 parcelas fixas

        const cet = calculateCET(financed, schedule);

        // CET esperado ~10.47% (resultado arredondado)
        expect(cet).toBeGreaterThan(10);
        expect(cet).toBeLessThan(11);
    });

    it("deve retornar um CET próximo de 0 quando os fluxos são neutros", () => {
        const financed = 1000;
        const schedule = [{ payment: 1000 }]; // devolve o mesmo valor

        const cet = calculateCET(financed, schedule);
        expect(cet).toBeCloseTo(0, 2);
    });

    it("deve lidar com fluxos muito pequenos sem erro de convergência", () => {
        const financed = 10000;
        const schedule = Array(12).fill({ payment: 0.01 });

        const cet = calculateCET(financed, schedule);

        // Apenas garantir que o retorno é numérico e não quebrou
        expect(Number.isNaN(cet)).toBe(false);
        expect(Number.isFinite(cet)).toBe(true);
    });

    it("deve retornar valor positivo mesmo com entrada grande", () => {
        const financed = 5000;
        const schedule = Array(10).fill({ payment: 600 });
        const cet = calculateCET(financed, schedule);
        expect(cet).toBeGreaterThan(0);
    });
});
