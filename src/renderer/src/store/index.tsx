import { createCustom } from './modules/config';

export const [baseData, useBaseData,] = createCustom<IUseBaseData>((cache, set) => cache({
    init: 0,
    test: 1,
    updateTest: () => set((state) => ({ test: ++state.test, })),
}));

interface IUseBaseData {
    init: number;
    test: number;
    updateTest: () => void;
}
