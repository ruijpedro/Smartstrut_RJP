import React from 'react'
export default function BrandMark({compact=false}:{compact?:boolean}){
  return <div className={`brand-mark ${compact?'compact':''}`}>
    <img src={`${import.meta.env.BASE_URL}smartstruct-symbol.png`} alt="SmartStruct_RJP"/>
    {!compact&&<div><b>SmartStruct_RJP</b><span>Engineering Suite</span></div>}
  </div>
}
