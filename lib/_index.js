
import React, { PropTypes } from 'react';
import {
  View,
  Text,
  Modal,
  Dimensions,
  Picker,
  StyleSheet,
  TouchableOpacity,
  Platform
} from 'react-native';
import BaseComponent from './BaseComponent';
// import webRegionAPI from './webRegionAPI';
import regionData from './region.js';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const isIos = Platform.OS === 'ios';

export default class ChinaRegionWheelPicker extends BaseComponent {

  constructor(props) {
    super(props);
    this._bind(
      'open',
      'close',
      '_handleProvinceChange',
      '_handleCityChange',
      '_handleAreaChange',
      '_handleSubmit',
      '_handleCancel',
    );
    this.state = {
      isVisible: this.props.isVisible,
      provinces: [],
      citys: [],
      areas: [],
      selectedProvince: this.props.selectedProvince,
      selectedCity: this.props.selectedCity,
      selectedArea: this.props.selectedArea,
      transparent: true,
    };
  }

  componentDidMount() {
    // webRegionAPI().then((area) => {
    //   console.log('area', area);
      const provinces = this._filterAllProvinces();
      // console.log('provinces', provinces);

      const citys = this._filterCitys(this.state.selectedProvince);

      // const areas = this._filterAreas(this.state.selectedProvince, this.state.selectedCity);

      this.setState({
        provinces,
        citys,
        // areas
      });
    // });
  }

  _filterAllProvinces() {
    return regionData.subAreas.map((item) => {
      return {province: item.REGION_NAME, provinceCode: item.REGION_CODE};
    });
  }
  _filterCitys(province) {
    let p = province.split(';')[0];
    const provinceData = regionData.subAreas.find(item => item.REGION_NAME === p);
    return provinceData.subAreas.map(item => { return {city: item.REGION_NAME, cityCode: item.REGION_CODE} });
  }
  _filterAreas(province, city) {
    let p = province.split(';')[0];
    let c = city.split(';')[0];
    const provinceData = regionData.subAreas.find(item => item.REGION_NAME === p);
    const cityData = provinceData.subAreas.find(item => item.REGION_NAME === c);
    return cityData.subAreas.map(item => { return {area: item.REGION_NAME, areaCode: item.REGION_CODE} });
  }

  componentWillReceiveProps(props) {
    if (props.isVisible !== this.props.isVisible) {
      if (props.isVisible) {
        this.open();
      } else {
        this.close();
      }
    }
  }

  close() {
    this.setState({ isVisible: false });
  }
  open() {
    this.setState({ isVisible: true });
  }

  _handleProvinceChange(province) {
    let p = province.split(';');
    const citys = this._filterCitys(province);
    let c = citys[0].city + ';' + citys[0].cityCode;
    // const areas = this._filterAreas(province, c);
    // let a = areas[0].area + ';' + areas[0].areaCode;

    this.setState({
      selectedProvince: province,
      selectedCity: c,
      // selectedArea: a,
      citys,
      // areas
    });
  }
  _handleCityChange(city) {
    let c = city.split(';');
    // const areas = this._filterAreas(this.state.selectedProvince, city);
    // let a = areas[0].area + ';' + areas[0].areaCode;

    this.setState({
      selectedCity: city,
      // selectedArea: a,
      // areas
    });
  }
  _handleAreaChange(area) {
    this.setState({
      selectedArea: area,
    });
  }

  _handleCancel() {
    if (this.props.onCancel) {
      this.props.onCancel();
    }
    this.close();
  }
  _handleSubmit() {
    if (this.props.onSubmit) {
      let p = this.state.selectedProvince.split(';');
      let c = this.state.selectedCity.split(';');
      // let a = this.state.selectedArea.split(';');
      this.props.onSubmit({
        province: p[0],
        provinceCode: p[1],
        city: c[0],
        cityCode: c[1],
        // area: a[0],
        // areaCode: a[1]
      });
    }
    this.close();
  }

  renderPicker() {
    const { navBtnColor } = this.props;
    return (
      <View style={styles.overlayStyle}>
        <View style={[styles.pickerContainer, isIos ? {} : { marginTop: windowHeight - 80 - this.props.androidPickerHeight }]}>
          <View style={styles.navWrap}>
            <TouchableOpacity
              style={[styles.navBtn, { borderColor: navBtnColor }]}
              activeOpacity={0.85}
              onPress={this._handleCancel}
            >
              <Text style={[styles.text, { color: navBtnColor }]}>取消</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.navBtn, { backgroundColor: navBtnColor, borderColor: navBtnColor }]}
              activeOpacity={0.85}
              onPress={this._handleSubmit}
            >
              <Text style={[styles.text, { color: 'white' }]}>确认</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.pickerWrap}>

            <Picker
              style={styles.pickerItem}
              onValueChange={this._handleProvinceChange}
              selectedValue={this.state.selectedProvince}
            >
              {this.state.provinces.map((province, index) => {
                return (
                  <Picker.Item value={province.province+';'+province.provinceCode} label={province.province} key={index} />
                );
              })}
            </Picker>

            <Picker
              style={styles.pickerItem}
              onValueChange={this._handleCityChange}
              selectedValue={this.state.selectedCity}
            >
              {this.state.citys.map((city, index) => {
                return (
                  <Picker.Item value={city.city+';'+city.cityCode} label={city.city} key={index} />
                );
              })}
            </Picker>

          </View>
        </View>
      </View>
    );
    // <Picker
    //   style={styles.pickerItem}
    //   onValueChange={this._handleAreaChange}
    //   selectedValue={this.state.selectedArea}
    // >
    //   {this.state.areas.map((area, index) => {
    //     return (
    //       <Picker.Item value={area.area+';'+area.areaCode} label={area.area} key={index} />
    //     );
    //   })}
    // </Picker>

  }

  render() {
    const modal = (
      <Modal
        transparent={this.state.transparent}
        visible={this.state.isVisible}
        onRequestClose={this.close}
        animationType={this.props.animationType}
      >
        {this.renderPicker()}
      </Modal>
    );

    return (
      <View>
        {modal}
        <TouchableOpacity onPress={this.open}>
          {this.props.children}
        </TouchableOpacity>
      </View>
    );
  }
}
ChinaRegionWheelPicker.propTypes = {
  isVisible: PropTypes.bool,
  selectedProvince: PropTypes.string,
  selectedCity: PropTypes.string,
  selectedArea: PropTypes.string,
  navBtnColor: PropTypes.string,
  animationType: PropTypes.string,
  transparent: PropTypes.bool,
  onSubmit: PropTypes.func,
  onCancel: PropTypes.func,
  androidPickerHeight: PropTypes.number,
};

ChinaRegionWheelPicker.defaultProps = {
  isVisible: false,
  selectedProvince: '北京市'+';'+'110000',
  selectedCity: '市辖区'+';'+'110100',
  selectedArea: '东城区'+';'+'110101',
  navBtnColor: 'blue',
  animationType: 'slide',
  transparent: true,
  onSubmit: () => {},
  onCancel: () => {},
  androidPickerHeight: 50
};

const styles = StyleSheet.create({
  overlayStyle: {
    flex: 1,
    width: windowWidth,
    height: windowHeight,
    left: 0,
    position: 'absolute',
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
  },
  pickerContainer: {
    flex: 1,
    marginTop: windowHeight * 3 / 5,
    backgroundColor: '#FFF'
  },
  navWrap: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderTopWidth: 1,
    borderColor: '#ccc'
  },
  navBtn: {
    paddingVertical: 5,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderRadius: 4
  },
  text: {
    fontSize: 18,
  },
  pickerWrap: {
    flexDirection: 'row'
  },
  pickerItem:
    isIos?
    {
      flex: 1,
    }
    :
    {
      flex: 1,
      color: 'black'
    }
});
