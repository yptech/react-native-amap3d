/* eslint-disable camelcase */
// @flow
import React, { PureComponent } from 'react'
import { Element } from 'react'
import { ViewPropTypes } from 'react-native'
import SuperCluster from 'supercluster'
import { LatLng, Point } from '../../PropTypes'
import ClusterView from './ClusterView'

export default class Cluster extends PureComponent<Props, State> {
  static defaultProps = { radius: 600 }

  constructor(props) {
    super(props);
    this.state = { clusters: [] }
    this.cluster = null;
  }

  componentDidMount() {
    this.init(this.props)
  }

  componentWillReceiveProps(props) {
    this.init(props)
  }

  init(props) {
    const { radius } = props
    this.cluster = SuperCluster({ radius, minZoom: 3, maxZoom: 21 })
      .load(props.markers.map(marker => ({
        geometry: {
          coordinates: [marker.coordinate.longitude, marker.coordinate.latitude],
          properties: marker.extra,
        },
      })))
  }

  update(status) {
    this.setState({
      clusters: this.cluster.getClusters([
        status.longitude - (status.longitudeDelta / 2),
        status.latitude - (status.latitudeDelta / 2),
        status.longitude + (status.longitudeDelta / 2),
        status.latitude + (status.latitudeDelta / 2),
      ], Math.round(status.zoomLevel)),
    })
  }

  renderCluster = (cluster) => (
    <ClusterView
      key={cluster.id}
      cluster={cluster}
      onPress={this.props.onPress}
      style={this.props.clusterStyle}
      textStyle={this.props.clusterTextStyle}
    />
  )

  render() {
    return this.state.clusters.map(cluster => {
      const { geometry, properties } = cluster
      const { renderCluster, renderMarker } = this.props
      const coordinate = {
        latitude: geometry.coordinates[1],
        longitude: geometry.coordinates[0],
      }

      if (properties) {
        const { cluster_id, point_count } = cluster.properties
        const render = renderCluster || this.renderCluster
        return render({ coordinate, id: cluster_id, count: point_count })
      }

      return renderMarker({ coordinate, extra: geometry.properties })
    })
  }
}
