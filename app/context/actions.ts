export function createActionPayload<TypeAction, TypePayload>(
    actionType: TypeAction
): (payload: TypePayload) => IActionWithPayload<TypeAction, TypePayload> {
    return (p: TypePayload): IActionWithPayload<TypeAction, TypePayload> => {
        return {
            payload: p,
            type: actionType
        }
    }
}

/**
 * Create an action with no payload
 */
export function createAction<TypeAction>(actionType: TypeAction): () => IActionWithoutPayload<TypeAction> {
    return (): IActionWithoutPayload<TypeAction> => {
        return {
            type: actionType
        }
    }
}
/**
 * Create an action with a payload
 */
export interface IActionWithPayload<TypeAction, TypePayload> {
    type: TypeAction
    payload: TypePayload
}

/**
 * Create an action that does not have a payload
 */
export interface IActionWithoutPayload<TypeAction> {
    type: TypeAction
}

/**
 * A very general type that means to be "an object with a many field created with createActionPayload and createAction
 */
interface ActionCreatorsMapObject {
    [key: string]: (...args: any[]) => IActionWithPayload<any, any> | IActionWithoutPayload<any>
}

/**
 * Use this Type to merge several action object that has field created with createActionPayload or createAction
 * E.g. type ReducerWithActionFromTwoObjects = ActionsUnion<typeof ActionsObject1 &amp; typeof ActionsObject2>;
 */
export type ActionsUnion<A extends ActionCreatorsMapObject> = ReturnType<A[keyof A]>
