var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import chalk from 'chalk';
export class ComponentPropsService {
    /**
     * SSR mode
     * Fetch component props using getServerSideProps function
     * @param {FetchComponentPropsArguments<GetServerSidePropsContext>} params fetch params
     * @returns {Promise<ComponentPropsCollection>} props
     */
    fetchServerSideComponentProps(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const { componentModule, layoutData, context } = params;
            const fetchFunctionFactory = (componentName) => __awaiter(this, void 0, void 0, function* () {
                const module = yield componentModule(componentName);
                return module === null || module === void 0 ? void 0 : module.getServerSideProps;
            });
            return this.fetchComponentProps(fetchFunctionFactory, layoutData, context);
        });
    }
    /**
     * SSG mode
     * Fetch component props using getStaticProps function
     * @param {FetchComponentPropsArguments<GetStaticPropsContext>} params fetch arguments
     * @returns {Promise<ComponentPropsCollection>} props
     */
    fetchStaticComponentProps(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const { componentModule, layoutData, context } = params;
            const fetchFunctionFactory = (componentName) => __awaiter(this, void 0, void 0, function* () {
                const module = yield componentModule(componentName);
                return module === null || module === void 0 ? void 0 : module.getStaticProps;
            });
            return this.fetchComponentProps(fetchFunctionFactory, layoutData, context);
        });
    }
    /**
     * Traverse Layout Service data tree and call side effects on component level.
     * Side effect function can be: getStaticProps (SSG) or getServerSideProps (SSR)
     * @param {FetchFunctionFactory<NextContext>} fetchFunctionFactory fetch function factory
     * @param {LayoutServiceData} layoutData layout data
     * @param {NextContext} context next context
     * @returns {Promise<ComponentPropsCollection>} component props
     */
    fetchComponentProps(fetchFunctionFactory, layoutData, context) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            // Array of side effect functions
            const requests = yield this.collectRequests({
                placeholders: (_a = layoutData.sitecore.route) === null || _a === void 0 ? void 0 : _a.placeholders,
                fetchFunctionFactory,
                layoutData,
                context,
            });
            return yield this.execRequests(requests);
        });
    }
    /**
     * Go through layout service data, check all renderings using displayName, which should make some side effects.
     * Write result in requests variable
     * @param {Object} params params
     * @param {PlaceholdersData} [params.placeholders]
     * @param {FetchFunctionFactory<NextContext>} params.fetchFunctionFactory
     * @param {LayoutServiceData} params.layoutData
     * @param {NextContext} params.context
     * @param {ComponentPropsRequest<NextContext>[]} params.requests
     * @returns {ComponentPropsRequest<NextContext>[]} array of requests
     */
    collectRequests(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const { placeholders = {}, fetchFunctionFactory, layoutData, context } = params;
            // Will be called on first round
            if (!params.requests) {
                params.requests = [];
            }
            const renderings = this.flatRenderings(placeholders);
            const actions = renderings.map((r) => __awaiter(this, void 0, void 0, function* () {
                const fetchFunc = yield fetchFunctionFactory(r.componentName);
                if (fetchFunc) {
                    params.requests &&
                        params.requests.push({
                            fetch: fetchFunc,
                            rendering: r,
                            layoutData: layoutData,
                            context,
                        });
                }
                // If placeholders exist in current rendering
                if (r.placeholders) {
                    yield this.collectRequests(Object.assign(Object.assign({}, params), { placeholders: r.placeholders }));
                }
            }));
            yield Promise.all(actions);
            return params.requests;
        });
    }
    /**
     * Execute request for component props
     * @param {ComponentPropsRequest<NextContext>[]} requests requests
     * @returns {Promise<ComponentPropsCollection>} requests result
     */
    execRequests(requests) {
        return __awaiter(this, void 0, void 0, function* () {
            const componentProps = {};
            const promises = requests.map((req) => {
                const { uid } = req.rendering;
                if (!uid) {
                    console.log(`Component ${req.rendering.componentName} doesn't have uid, can't store data for this component`);
                    return;
                }
                return req
                    .fetch(req.rendering, req.layoutData, req.context)
                    .then((result) => {
                    // Set component specific data in componentProps store
                    componentProps[uid] = result;
                })
                    .catch((error) => {
                    const errLog = `Error during preload data for component ${uid}: ${error.message ||
                        error}`;
                    console.error(chalk.red(errLog));
                    componentProps[uid] = {
                        error: error.message || errLog,
                    };
                });
            });
            yield Promise.all(promises);
            return componentProps;
        });
    }
    /**
     * Take renderings from all placeholders and returns a flat array of renderings.
     * @example
     * const placeholders = {
     *    x1: [{ uid: 1 }, { uid: 2 }],
     *    x2: [{ uid: 11 }, { uid: 22 }]
     * }
     *
     * flatRenderings(placeholders);
     *
     * RESULT: [{ uid: 1 }, { uid: 2 }, { uid: 11 }, { uid: 22 }]
     *
     * @param {PlaceholdersData} placeholders placeholders
     * @returns {ComponentRendering[]} renderings
     */
    flatRenderings(placeholders) {
        const allComponentRenderings = [];
        const placeholdersArr = Object.values(placeholders);
        placeholdersArr.forEach((pl) => {
            const renderings = pl;
            allComponentRenderings.push(...renderings);
        });
        return allComponentRenderings;
    }
}
