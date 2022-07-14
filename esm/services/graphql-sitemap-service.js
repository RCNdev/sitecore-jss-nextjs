var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { GraphQLRequestClient, debug, getAppRootId, SearchQueryService, } from '@sitecore-jss/sitecore-jss';
/** @private */
export const queryError = 'Valid value for rootItemId not provided and failed to auto-resolve app root item.';
/** @private */
export const languageError = 'The list of languages cannot be empty';
// Even though _hasLayout should always be "true" in this query, using a variable is necessary for compatibility with Edge
const defaultQuery = /* GraphQL */ `
  query SitemapQuery(
    $rootItemId: String!
    $language: String!
    $pageSize: Int = 10
    $hasLayout: String = "true"
    $after: String
  ) {
    search(
      where: {
        AND: [
          { name: "_path", value: $rootItemId, operator: CONTAINS }
          { name: "_language", value: $language }
          { name: "_hasLayout", value: $hasLayout }
        ]
      }
      first: $pageSize
      after: $after
    ) {
      total
      pageInfo {
        endCursor
        hasNext
      }
      results {
        url {
          path
        }
      }
    }
  }
`;
/**
 * Service that fetches the list of site pages using Sitecore's GraphQL API.
 * This list is used for SSG and Export functionality.
 * @mixes SearchQueryService<PageListQueryResult>
 */
export class GraphQLSitemapService {
    /**
     * Creates an instance of graphQL sitemap service with the provided options
     * @param {GraphQLSitemapServiceConfig} options instance
     */
    constructor(options) {
        this.options = options;
        this.graphQLClient = this.getGraphQLClient();
        this.searchService = new SearchQueryService(this.graphQLClient);
    }
    /**
     * Gets the default query used for fetching the list of site pages
     */
    get query() {
        return defaultQuery;
    }
    /**
     * Fetch sitemap which could be used for generation of static pages during `next export`.
     * The `locale` parameter will be used in the item query, but since i18n is not supported,
     * the output paths will not include a `language` property.
     * @param {string} locale which application supports
     * @returns an array of @see StaticPath objects
     */
    fetchExportSitemap(locale) {
        return __awaiter(this, void 0, void 0, function* () {
            const formatPath = (path) => ({
                params: {
                    path,
                },
            });
            return this.fetchSitemap([locale], formatPath);
        });
    }
    /**
     * Fetch sitemap which could be used for generation of static pages using SSG mode
     * @param {string[]} locales locales which application supports
     * @returns an array of @see StaticPath objects
     */
    fetchSSGSitemap(locales) {
        return __awaiter(this, void 0, void 0, function* () {
            const formatPath = (path, locale) => ({
                params: {
                    path,
                },
                locale,
            });
            return this.fetchSitemap(locales, formatPath);
        });
    }
    /**
     * Fetch a flat list of all pages that are descendants of the specified root item and have a
     * version in the specified language(s).
     * @param {string[]} languages Fetch pages that have versions in this language(s).
     * @param {Function} formatStaticPath Function for transforming the raw search results into (@see StaticPath) types.
     * @returns list of pages
     * @throws {RangeError} if the list of languages is empty.
     * @throws {Error} if the app root was not found for the specified site and language.
     */
    fetchSitemap(languages, formatStaticPath) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!languages.length) {
                throw new RangeError(languageError);
            }
            // If the caller does not specify a root item ID, then we try to figure it out
            const rootItemId = this.options.rootItemId ||
                (yield getAppRootId(this.graphQLClient, this.options.siteName, languages[0], this.options.jssAppTemplateId));
            if (!rootItemId) {
                throw new Error(queryError);
            }
            // Fetch paths using all locales
            const paths = yield Promise.all(languages.map((language) => {
                debug.sitemap('fetching sitemap data for %s', language);
                return this.searchService
                    .fetch(this.query, {
                    rootItemId,
                    language,
                    pageSize: this.options.pageSize,
                })
                    .then((results) => {
                    return results.filter((item) => item === null || item === void 0 ? void 0 : item.url).map((item) => formatStaticPath(item.url.path.replace(/^\/|\/$/g, '').split('/'), language));
                });
            }));
            // merge promises results into single result
            return [].concat(...paths);
        });
    }
    /**
     * Gets a GraphQL client that can make requests to the API. Uses graphql-request as the default
     * library for fetching graphql data (@see GraphQLRequestClient). Override this method if you
     * want to use something else.
     * @returns {GraphQLClient} implementation
     */
    getGraphQLClient() {
        return new GraphQLRequestClient(this.options.endpoint, {
            apiKey: this.options.apiKey,
            debugger: debug.sitemap,
        });
    }
    /**
     * Gets a service that can perform GraphQL "search" queries to fetch @see PageListQueryResult
     * @returns {SearchQueryService<PageListQueryResult>} the search query service
     */
    getSearchService() {
        return new SearchQueryService(this.graphQLClient);
    }
}
