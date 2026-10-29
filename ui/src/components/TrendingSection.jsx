import React from 'react'
import { Link } from 'react-router-dom'
import { FaStar } from "react-icons/fa";
import { useNavigate } from "react-router-dom";


const TrendingSection = () => {
  const navigate = useNavigate();
  
    const fetchBids = () => {
      navigate("/user-bids");
    };
  return (
    <>

      <div className="row py-3 trending">
        <div className='col-sm-10 mx-auto'>
          <div className='webheading'>Trending <b className='text-color1'>Contracts</b></div>
          <hr className='w-25 mx-auto text-color1' />
          <div className="row">

            <div className="col-sm-3">
              <div className='card shadow-lg mx-auto border border-0 trendingcard position-relative p-2'>
                <img src="/images/course-04-590x430.jpg" alt="" className='img-fluid' />
                <span className='badge bg-color-1 position-absolute'>Fixed Priced</span>
                <h6 className='m-0 pt-2'>E-Commerce Website</h6>
                <p className='m-0 trendingstar'>
                  <FaStar className='text-warning' />
                  <FaStar className='text-warning' />
                  <FaStar className='text-warning' />
                  <FaStar className='text-warning' />
                  <FaStar className='text-warning' />
                  (5.0/499 ratings)
                </p>
                <p className='text-danger m-0 trendingprice'>Rs.1,11,11/-</p>
                <div>
                  <span className='float-start'>152 bids</span>
                  <span className='float-end'> 45545 views</span>
                </div>
                <button className='w-50  py-2 rounded mt-1  herobtn' onClick={fetchBids }>Place Bid</button>
              </div>
            </div>

            <div className="col-sm-3">
              <div className='card shadow-lg mx-auto border border-0 trendingcard position-relative p-2'>
                <img src="/images/course-04-590x430.jpg" alt="" className='img-fluid' />
                <span className='badge bg-color-1 position-absolute'>Fixed Priced</span>
                <h6 className='m-0 pt-2'>Student ERP</h6>
                <p className='m-0 trendingstar'>
                  <FaStar className='text-warning' />
                  <FaStar className='text-warning' />
                  <FaStar className='text-warning' />
                  <FaStar className='text-warning' />
                  <FaStar className='text-warning' />
                  (4.5/499 ratings)
                </p>
                <p className='text-danger m-0 trendingprice'>Rs.1,12,545/-</p>
                <div>
                  <span className='float-start'>9 bids</span>
                  <span className='float-end'> 45255 views</span>
                </div>
                <button className='w-50 py-2 rounded mt-1  herobtn' onClick={fetchBids }>Place Bid</button>
              </div>
            </div>

            <div className="col-sm-3">
              <div className='card shadow-lg mx-auto border border-0 trendingcard position-relative p-2'>
                <img src="/images/course-04-590x430.jpg" alt="" className='img-fluid' />
                <span className='badge bg-color-1 position-absolute'>Fixed Priced</span>
                <h6 className='m-0 pt-2'>Heatlth Care</h6>
                <p className='m-0 trendingstar'>
                  <FaStar className='text-warning' />
                  <FaStar className='text-warning' />
                  <FaStar className='text-warning' />
                  <FaStar className='text-warning' />
                  <FaStar className='text-warning' />
                  (4.3/429 ratings)
                </p>
                <p className='text-danger m-0 trendingprice'>Rs.5,56,68/-</p>
                <div>
                  <span className='float-start'>229 bids</span>
                  <span className='float-end'> 10205 views</span>
                </div>
                <button className=' w-50  py-2 rounded mt-1  herobtn' onClick={fetchBids }>Place Bid</button>
              </div>
            </div>

            <div className="col-sm-3">
              <div className='card shadow-lg mx-auto border border-0 trendingcard position-relative p-2'>
                <img src="/images/course-04-590x430.jpg" alt="" className='img-fluid' />
                <span className='badge bg-color-1 position-absolute'>Fixed Priced</span>
                <h6 className='m-0 pt-2'>Agriculture & Farmer</h6>
                <p className='m-0 trendingstar'>
                  <FaStar className='text-warning' />
                  <FaStar className='text-warning' />
                  <FaStar className='text-warning' />
                  <FaStar className='text-warning' />
                  <FaStar className='text-warning' />
                  (4.5/499 ratings)
                </p>
                <p className='text-danger m-0 trendingprice'>Rs.5,11,11/-</p>
                <div>
                  <span className='float-start'>58 bids</span>
                  <span className='float-end'> 45255 views</span>
                </div>
                <button className='w-50  py-2 rounded mt-1  herobtn' onClick={fetchBids }>Place Bid</button>
              </div>
            </div>

          </div>
        </div>
      </div>

    </>
  )
}

export default TrendingSection