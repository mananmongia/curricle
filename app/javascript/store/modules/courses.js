// Manipulation of non-course-related course-specific data

import _ from 'lodash'

import ApolloClient from 'apollo-client-preset'
import gql from 'graphql-tag'

const client = new ApolloClient()

/*
 * This basic idea behind this module is to provide a location to
 * store full course data for all courses we've seen in a consistent
 * format; this is a registry of sorts.  Subsequent modules can use
 * routines to resolve/gather sets of courses that match specific ids.
 */

const state = {
  courses: {}
}

const getters = {
}

const actions = {
  /*
   * Register an array of objects as courses in the registry, indexed
   * off of their id.  (This will probably be from the search for the
   * most part.)
   */
  registerCourses ({ commit }, courses) {
    commit('ADD_COURSES', courses)
  },

  /*
   * Lookup course information given a list of course ids and populate
   * in the registry.  Will replace anything in the existing registry.
   */
  lookupCourses ({ commit, state }, courses) {
    // NOTE: need to keep this structure in sync with the one in search.js
    client.query({
      query: gql`
        query CourseSearch(id: [$ids]) {
          courses(id: [$ids]) {
            academic_group
            catalog_number
            component
            course_description_long
            id
            subject
            term_name
            term_year
            title
            units_maximum
            course_instructors {
              display_name
              id
            }
            course_meeting_patterns {
              id
              meeting_time_start_tod
              meeting_time_end_tod
              meets_on_monday
              meets_on_tuesday
              meets_on_wednesday
              meets_on_thursday
              meets_on_friday
              meets_on_saturday
              meets_on_sunday
            }
          }
        }
      `,
      variables: { ids: courses }
    })
      .then(response => {
        commit('ADD_COURSES', response.data.courses)
      })
  },

  /*
   * Return an object of course objects from the registry given a list
   * of course ids, looking up as required for any missing objects
   */

  resolveCourses ({ dispatch, state }, courses) {
    // find the missing ids, add 'em and return the results
    var missing = _.difference(_.keys(state.courses), courses)

    if (missing) {
      dispatch('lookupCourses', missing).then(() => {
        dispatch('getCourses', courses).then(
          c => c
        )
      })
    } else {
      dispatch('getCourses')
    }
  },

  /*
   * Return an object of objects indexed by id from the registry.
   * Skips missing.
   */

  getCourses ({ state }, courses) {
    var obj

    _.each(courses, course => { if (state.courses[course]) { obj[course] = state.courses[course] } })

    return obj
  },

  /*
   * Return information from a single course by id from the registry
   */
  getCourseById ({ state }, course) {
    return state.courses[course]
  }

}

const mutations = {
  ADD_COURSES: (state, courses) => {
    _.each(courses, course => { state.courses[ course.id ] = course })
  }
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}