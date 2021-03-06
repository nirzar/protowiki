import {reducer} from './util'
import RemoteData from '../data/remote-data'
import {Union} from 'results'

const Origin = Union({
  DB: {}, Network: {}, Unknown: {}
}, {
  isSaved () {
    return Origin.match(this, {
      DB: _ => true,
      _: _ => false
    })
  }
})

const initial = {
  title: null,
  data: RemoteData.NotAsked(),
  origin: Origin.Unknown(),
  saved: false
}

export default reducer(initial, {

  GetArticle: (state, {title}) =>
    ({ ...initial, title, data: RemoteData.Loading() }),

  FromDB: (state, {title, article}) =>
    title === state.title
      ? {
        title,
        data: RemoteData.Success(article),
        origin: Origin.DB(),
        saved: true
      } : state,

  FromNetwork: (state, {title, article}) =>
    title === state.title && (
      // No data or
      !state.data.isSuccess() ||
      // Yes data but newer revision, autoupdate
      (state.data.isSuccess() &&
       state.data.unwrap().revision !== article.revision)
    )
      ? {
        ...state, // Inherit props like `saved` but update content and origin
        data: RemoteData.Success(article),
        origin: Origin.Network()
      } : state,

  GetArticleFailure: (state, {title, error}) =>
    // If it's not the current article, or it is and there is successful data,
    // ignore the error
    (state.title !== title ||
     (state.title === title && state.data.isSuccess())) ? state
      // If there's an error and there's no valid article content then
      // then set the error
      : ({
        title, data: RemoteData.Failure(error), origin: Origin.Unknown()
      }),

  ArticleSaved: (state, {title}) =>
    state.title === title ? {...state, saved: true} : state,

  ArticleUnsaved: (state, {title}) =>
    state.title === title ? {...state, saved: false} : state,

  _: state => state

})
