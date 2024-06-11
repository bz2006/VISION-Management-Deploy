import React, { useEffect, useState } from 'react'
import HeaderComp from "../components/header"
import axios from 'axios';
import { Select, Input, InputNumber, Checkbox, DatePicker, Spin,message } from "antd";
import "./getinvoice.css"
import * as Icons from '@ant-design/icons';
const { PlusOutlined } = Icons;
const { DeleteOutlined } = Icons;



function Invoice() {


  const [size] = useState('large');
  const [invoiceNo, setInvoiceNo] = useState("")
  const [Date, setDate] = useState("")
  const [Marketplc, setMarketplc] = useState("")
  const [POno, setPOno] = useState("")
  const [Vendorc, setVendorc] = useState("")
  const [Mrpart, setMrpart] = useState("")
  const [Models, setModels] = useState([])
  const [Instructions, setInstructions] = useState("")
  const [Acno, setAcno] = useState("")
  const [Taxmethod, setTaxmethod] = useState("")
  const [VehicleNo, setVehicleNo] = useState("")
  const [latest, setlatest] = useState("")
  const [addgst, setAddgst] = useState(true)
  const [Genmrp, setGenmrp] = useState(true)
  const [fetchcatlog, setFetchcatlog] = useState("")
  const [markid, setmarkid] = useState("")
  const [spinning, setSpinning] = useState(false);
  const [Markets, setMarkets] = useState([])
  const [Modellist, setModellist] = useState([])
  const [SelectedMarket, setSelectedMarket] = useState([])

if(Models.length>=18){
message.warning("Please dont add more than 19 models")
}

  const accno = [
    { value: '30891188652', label: ' 30891188652' },
    { value: '37647177049', label: '37647177049' },
  ];
  const mrporart = [
    { value: 'MRP', label: 'MRP' },
    { value: 'Article No', label: 'Article No' }
  ];
  const taxmethodop = [
    { value: '18%', label: '18%' },
    { value: '9%', label: '9% + 9%' }
  ];




  const GenerateInvoice = async () => {
    const res = await axios.get(`/api/v1/records/catlog/get-catlog/${fetchcatlog}`)
    console.log(res.data[0]["products"])
    const invData = [{
      invNo: invoiceNo,
      Date: Date,
      marketDet: SelectedMarket,
      marketid: markid,
      PO: POno,
      mrp: Mrpart,
      items: Models,
      catlog: res.data[0]['products'],
      Instructions: Instructions,
      VehicleNo: VehicleNo,
      Acno: Acno,
      taxmeth: Taxmethod,
      addgstrec: addgst

    }]
    localStorage.setItem("Invdet", JSON.stringify(invData));
    if (Genmrp === true) {
      GenerateMRP()
    }
    window.open("/generate-invoice", '_blank');
  }

  const GenerateMRP = () => {
    console.log("mm",Models)
    let Combined = splitProducts(Models)
    let Organized = GroupModels(Combined)
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    const ds = Date.split(".")
    const year = ds[2]
    const month = months[ds[1] - 1]
    const MrpData = [{
      Date: `${month} ${year}`,
      Models: Organized,
    }]

    console.log(Organized);
    localStorage.setItem("mrp", JSON.stringify(MrpData));
    window.open("/generate-mrp", '_blank');
  }

  const splitProducts = (products) => {
    let result = [];
    products.forEach(product => {
      if (product.inputValue > 1) {
        for (let i = 0; i < product.inputValue; i++) {
          result.push({ selectValue: product.selectValue, inputValue: 1, mrp: product.mrp });
        }
      } else {
        result.push(product);
      }
    });
    return result;
  }


  const GroupModels = (array) => {
    const groupedObjects = [];
    for (let i = 0; i < array.length; i += 12) {
      groupedObjects[i / 12] = array.slice(i, i + 12);
    }
    return groupedObjects;
  }



  const FetchMarkets = async () => {
    try {
      setSpinning(true);
      const res = await axios.get("/api/v1/records/markets/get-markets")
      setSpinning(false);
      setMarkets(res.data["markets"].map(market => ({ value: market._id, label: market.marketname })))

    } catch (error) {
      console.log(error)
    }
  }

  const GetLatestInv = async () => {
    try {
      setSpinning(true);
      const res = await axios.get("/api/v1/invoices/latest-inv")
      setlatest(res.data.inv["invNo"])
      setSpinning(false);


    } catch (error) {
      console.log(error)
    }
  }
  useEffect(() => {
    FetchMarkets()
    GetLatestInv()
  }, [])


  const FetchCatlog = async (id) => {
    console.log("calog fetch")
    try {

      setSpinning(true);
      const res = await axios.get(`/api/v1/records/markets/get-market/${id}`)
      setmarkid(res.data["markets"]["_id"])
      setSelectedMarket(res.data["markets"])
      let catlog = (res.data["linkedcatlog"])
      setFetchcatlog(catlog)
      setVendorc(res.data["vendorcode"])
      const rescatlog = await axios.get(`/api/v1/records/catlog/get-catlog/${catlog}`)
      setSpinning(false);
      console.log(rescatlog.data)
      setModellist(rescatlog.data[0]["products"].map(catlog => ({ value: catlog.model, label: catlog.model, mrp: catlog.mrp })))
    } catch (error) {
      console.log(error)
    }
  }



  // ----------------------------------------------------------------

  const handleChange = (value, index, field) => {
    const updatedModels = [...Models];
    if (field === 'selectValue') {
      const selectedModel = Modellist.find(model => model.value === value);
      if (selectedModel) {
        updatedModels[index] = {
          selectValue: selectedModel.value,
          inputValue: 1, 
          mrp: selectedModel.mrp 
        };
      }
    } else {
      updatedModels[index] = { ...updatedModels[index], [field]: value };
    }
    setModels(updatedModels);
  };

  const handleAdd = () => {
    setModels([...Models, { selectValue: null, inputValue: 1 }]);
  };
  const handledel = (index) => {
    const updatedModels = [...Models];
    updatedModels.splice(index, 1);
    setModels(updatedModels);

  };
  const Handledate = (date) => {
    if (date != null) {
      setDate(date.format("DD.MM.YYYY"));
    }

  };
  return (
    <>
      <Spin spinning={spinning} fullscreen size='large' />
      <HeaderComp />
      <div style={{ padding: "30px" }}>
        <div className='invdiv'>


          <div style={{ display: "flex", paddingLeft: "20px", marginBottom: "-25px" }}>
            <h5 style={{ marginRight: "18%" }}>Invoice No</h5>
            <h5 style={{ marginRight: "15%" }}>Last Invoice No</h5>
            <h5 style={{ marginRight: "0%" }}>Date</h5>
          </div>
          <div style={{ display: "flex", margin: "20px" }}>

            <Input value={invoiceNo} onChange={(event) => { setInvoiceNo(event.target.value) }} suffix="/24-25" placeholder="Invoice No (V001)" size='large' style={{ width: "200px", marginRight: "5%" }} />
            <Input style={{ marginRight: "5%", width: "200px" }} value={latest+"/24-25"} readOnly />
            <DatePicker onChange={Handledate} format={"DD.MM.YYYY"} />
          </div>


          <div style={{ display: "flex", paddingLeft: "20px", marginBottom: "-25px" }}>
            <h5 style={{ marginRight: "17%" }}>Market Place</h5>
            <h5 style={{ marginRight: "19%" }}>P.O No</h5>
            <h5 >Vendor Code</h5>
          </div>
          <div style={{ display: "flex", margin: "20px" }}>
            <Select
              showSearch
              style={{
                width: 200, marginRight: "5%"
              }}
              size='large'
              placeholder="Search to Select"
              optionFilterProp="children"
              filterOption={(input, option) =>
                (option?.label?.toLowerCase() ?? '').includes(input.toLowerCase())
              }
              filterSort={(optionA, optionB) =>
                (optionA?.label ?? '').toLowerCase().localeCompare((optionB?.label ?? '').toLowerCase())
              }
              defaultValue={Marketplc} 
              onChange={(value) => {
                setMarketplc(value);
                FetchCatlog(value);
              }}
            >
              {Markets.map((market) => (
                <Select.Option key={market.value} value={market.value} label={market.label}>
                  {market.label}
                </Select.Option>
              ))}
            </Select>

            <Input value={POno} onChange={(event) => { setPOno(event.target.value) }} placeholder="P.O Number" size='large' style={{ width: "200px", marginRight: "5%" }} />
            <Input readOnly value={Vendorc} onChange={(event) => { setVendorc(event.target.value) }} placeholder="Vendor Code" size='large' style={{ width: "200px", marginRight: "5%" }} />
          </div>


          <div style={{ display: "flex", paddingLeft: "20px", marginBottom: "-25px" }}>
            <h5 style={{ marginRight: "17%" }}>MRP / Art No</h5>
            <h5 style={{ marginRight: "19%" }}>Add Models</h5>
          </div>
          <div style={{ display: "flex", margin: "20px" }}>
            <Select
              value={Mrpart}
              onChange={(value) => { setMrpart(value) }}
              size={size}
              defaultValue="MRP / Art No"
              style={{
                width: 200, marginRight: "5%"
              }}
              options={mrporart}
            />
            <div style={{ display: "flex", flexDirection: "column", minWidth: "450px", alignItems: "center" }}>

              {Models.map((model, index) => {
                return (
                  <div style={{ display: "flex", marginBottom: "10px" }} key={index}>
                    <Select
                      size={size}
                      placeholder="Select Model"
                      value={model.selectValue}
                      onChange={(value) => handleChange(value, index, 'selectValue')}
                      defaultValue="Model"
                      style={{ width: 200, marginRight: "5%" }}
                      options={Modellist}
                    />
                    <InputNumber
                      min={1}
                      value={model.inputValue}
                      onChange={(value) => handleChange(value, index, 'inputValue')}
                      defaultValue={1}
                      style={{ width: "200px", marginRight: "5%" }}
                      size='large'
                    /><DeleteOutlined onClick={() => { handledel(index) }} style={{ fontSize: "30px" }} />
                  </div>
                )
              })}
              <PlusOutlined style={{ fontSize: "30px" }} onClick={handleAdd} />
            </div>
          </div>


          <div style={{ display: "flex", paddingLeft: "20px", marginBottom: "-25px" }}>
            <h5 style={{ marginRight: "17%" }}>Instructions</h5>
            <h5 style={{ marginRight: "19%" }}>Vehicle No</h5>
            <h5 style={{ marginRight: "18%" }}>A/c No</h5>
            <h5 >Tax Method</h5>
          </div>
          <div style={{ display: "flex", margin: "20px" }}>
            <Input value={Instructions} maxLength={25} onChange={(event) => { setInstructions(event.target.value) }} placeholder="Instructions" size='large' style={{ width: "200px", marginRight: "5%" }} />
            <Input value={VehicleNo} maxLength={15} onChange={(event) => { setVehicleNo(event.target.value) }} placeholder="Vehicle No" size='large' style={{ width: "200px", marginRight: "5%" }} />
            <Select
              size={size}
              value={Acno}
              onChange={(value) => { setAcno(value) }}
              defaultValue="A/c No"
              style={{
                width: 200, marginRight: "5%"
              }}
              options={accno}
            />
            <Select
              size={size}
              value={Taxmethod}
              onChange={(value) => { setTaxmethod(value) }}
              defaultValue="Tax Method"
              style={{
                width: 200,
              }}
              options={taxmethodop}
            />

          </div>
          <div style={{ display: "flex", margin: "20px", marginTop: "40px" }}>
            <Checkbox checked={addgst} onChange={(event) => setAddgst(event.target.checked)} size="large" style={{ color: "white", marginRight: "5%" }}>Add to GST records</Checkbox>
            <Checkbox checked={Genmrp} onChange={(event) => setGenmrp(event.target.checked)} size="large" style={{ color: "white", marginRight: "5%" }}>Generate MRP</Checkbox>
          </div>
          <button onClick={GenerateInvoice} className='geninvbtn'>Generate Invoice</button>
        </div>
      </div>
    </>
  )
}

export default Invoice

